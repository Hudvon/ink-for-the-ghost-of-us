document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('letterForm');
  const lettersList = document.getElementById('lettersList');
  const viewSelect = document.getElementById('viewSelect');
  const searchContainer = document.getElementById('searchContainer');
  const searchInput = document.getElementById('searchInput');

  let allLetters = [];

  // Load letters from Firestore
  function loadLetters() {
    db.collection("letters")
    .orderBy("date", "desc")
    .get()
    .then((snapshot) => {
      allLetters = snapshot.docs.map(doc => doc.data());
      displayLetters(allLetters);
    })
    .catch((err) => {
      lettersList.innerHTML = '<p>Failed to load letters.</p>';
      console.error('❌ Error loading letters:', err);
    });
  }

  // Display filtered letters
  function displayLetters(letters) {
    lettersList.innerHTML = '';
    if (letters.length === 0) {
      lettersList.innerHTML = '<p>No letters found.</p>';
      return;
    }
    letters.forEach(letter => {
      const letterDiv = document.createElement('div');
      letterDiv.className = 'letter';
      letterDiv.innerHTML = `
      <div class="recipient">To: ${letter.recipient}</div>
      <div class="date">${new Date(letter.date).toLocaleString()}</div>
      <div class="message">${letter.message}</div>
      `;
      lettersList.appendChild(letterDiv);
    });
  }

  // Handle form submission and save to Firestore
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const recipient = form.recipient.value.trim();
    const message = form.message.value.trim();
    const date = new Date().toISOString();

    if (!recipient || !message) {
      alert('Please fill in both recipient and message.');
      return;
    }

    db.collection("letters").add({ recipient, message, date })
    .then(() => {
      console.log("✅ Letter submitted, switching to view...");
      form.reset();
      viewSelect.value = 'view';
      toggleView();        // 🔥 Force the switch manually
      loadLetters();       // 🔁 Refresh the list
    })
    .catch((err) => {
      alert('Error sending letter. Please try again.');
      console.error('❌ Error sending letter:', err);
    });
  });

  // Toggle views (submit or view)
  function toggleView() {
    console.log("🔄 Toggling to:", viewSelect.value);

    if (viewSelect.value === 'submit') {
      form.style.display = 'block';
      searchContainer.style.display = 'none';
      lettersList.style.display = 'none';
    } else {
      form.style.display = 'none';
      searchContainer.style.display = 'block';
      lettersList.style.display = 'block';

      const searchTerm = searchInput.value.trim().toLowerCase();
      console.log("🔍 Searching for:", searchTerm);

      if (searchTerm === '') {
        displayLetters(allLetters);
      } else {
        const filtered = allLetters.filter(letter =>
        letter.recipient.toLowerCase().includes(searchTerm)
        );
        displayLetters(filtered);
      }
    }
  }

  // Live search
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm === '') {
      displayLetters(allLetters);
      return;
    }
    const filtered = allLetters.filter(letter =>
    letter.recipient.toLowerCase().includes(searchTerm)
    );
    displayLetters(filtered);
  });

  // Set up the toggleView switch
  viewSelect.addEventListener('change', toggleView);
  toggleView();   // Initial load
  loadLetters();  // Fetch data
});
