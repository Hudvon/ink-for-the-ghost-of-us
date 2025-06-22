document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('letterForm');
  const lettersList = document.getElementById('lettersList');
  const viewSelect = document.getElementById('viewSelect');
  const searchContainer = document.getElementById('searchContainer');
  const searchInput = document.getElementById('searchInput');
  let allLetters = [];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const recipient = form.recipient.value.trim();
    const category = form.category ? form.category.value.trim() : '';
    const message = form.message.value.trim();
    const date = new Date().toISOString();

    if (!recipient || !message) return alert('Fill in both recipient and message.');

                        db.collection("letters").add({ recipient, message, date, category }).then(() => {
                          form.reset();
                          viewSelect.value = 'view';
                          loadLetters();
                        });
  });

  function loadLetters() {
    db.collection("letters").orderBy("date", "desc").get().then(snapshot => {
      allLetters = snapshot.docs.map(doc => doc.data());
      if (viewSelect.value === 'view') toggleView();
    });
  }

  function displayLetters(letters) {
    lettersList.innerHTML = '';
    if (letters.length === 0) {
      lettersList.innerHTML = '<p>No letters found.</p>';
      return;
    }
    letters.forEach(letter => {
      const div = document.createElement('div');
      div.className = 'letter';
      div.innerHTML = `
      <div class="recipient">To: ${letter.recipient}</div>
      <div class="date">${new Date(letter.date).toLocaleString()}</div>
      <div class="category">Category: ${letter.category || 'None'}</div>
      <div class="message">${letter.message}</div>`;
      lettersList.appendChild(div);
    });
  }

  function toggleView() {
    const isSubmit = viewSelect.value === 'submit';
    form.style.display = isSubmit ? 'block' : 'none';
    searchContainer.style.display = isSubmit ? 'none' : 'block';
    lettersList.style.display = isSubmit ? 'none' : 'block';
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (!isSubmit) {
      if (searchTerm === '') {
        lettersList.innerHTML = '<p>Type the full name of a recipient to search.</p>';
      } else {
        const filtered = allLetters.filter(letter => letter.recipient.toLowerCase() === searchTerm);
        displayLetters(filtered);
      }
    }
  }

  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm === '') {
      lettersList.innerHTML = '<p>Type the full name of a recipient to search.</p>';
    } else {
      const filtered = allLetters.filter(letter => letter.recipient.toLowerCase() === searchTerm);
      displayLetters(filtered);
    }
  });

  viewSelect.addEventListener('change', toggleView);
  toggleView();
  loadLetters();
});
