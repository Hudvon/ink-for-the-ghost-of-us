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
    .then(snapshot => {
      allLetters = snapshot.docs.map(doc => doc.data());
      console.log("✅ Letters loaded:", allLetters.length);
      if (viewSelect.value === 'view') {
        toggleView(); // Refresh the view if we're already in "view" mode
      }
    })
    .catch(err => {
      lettersList.innerHTML = '<p>Failed to load letters.</p>';
      console.error('❌ Error loading letters:', err);
    });
  }

  // Display letters
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

  // Handle letter submission
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
      console.log("✅ Letter submitted to Firestore");
      form.reset();
      viewSelect.value = 'view';
      toggleView();   // Switch to view mode
      loadLetters();  // Reload letters
    })
    .catch(err => {
      alert('Error sending letter. Please try again.');
      console.error('❌ Error sending letter:', err);
    });
  });

  // View switcher
  function toggleView() {
    const isSubmit = viewSelect.value === 'submit';

    form.style.display = isSubmit ? 'block' : 'none';
    searchContainer.style.display = isSubmit ? 'none' : 'block';
    lettersList.style.display = isSubmit ? 'none' : 'block';

    if (!isSubmit) {
      const searchTerm = searchInput.value.trim().toLowerCase();

      if (searchTerm === '') {
        lettersList.innerHTML = '<p>Type a name to search for letters sent to that person.</p>';
      } else {
        const filtered = allLetters.filter(letter =>
        letter.recipient.toLowerCase().includes(searchTerm)
        );
        displayLetters(filtered);
      }
    }
  }

  // Live search input
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (searchTerm === '') {
      lettersList.innerHTML = '<p>Type a name to search for letters sent to that person.</p>';
    } else {
      const filtered = allLetters.filter(letter =>
      letter.recipient.toLowerCase().includes(searchTerm)
      );
      displayLetters(filtered);
    }
  });

  // Dropdown change triggers toggle
  viewSelect.addEventListener('change', toggleView);

  // Initialize view
  toggleView();
  loadLetters();
});
