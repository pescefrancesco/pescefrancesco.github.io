async function caricaSito() {
  const contenuto = document.getElementById('contenuto');
  try {
    const risposta = await fetch('data.json', { cache: 'no-store' });
    const dati = await risposta.json();
    renderSito(dati);
  } catch (errore) {
    contenuto.innerHTML =
      '<p class="vuoto">Non è stato possibile caricare i contenuti (data.json). ' +
      'Se stai visualizzando questo file direttamente dal computer, aprilo tramite un sito pubblicato ' +
      '(es. GitHub Pages) invece che con doppio clic.</p>';
  }
}

function renderSito(dati) {
  document.title = `${dati.sito.nome} — ${dati.sito.ruolo}`;
  document.getElementById('sito-nome').textContent = dati.sito.nome;
  document.getElementById('sito-ruolo').textContent = dati.sito.ruolo;
  document.getElementById('sito-bio').textContent = dati.sito.bio;

  const indice = document.getElementById('indice');
  const contenuto = document.getElementById('contenuto');
  indice.innerHTML = '';
  contenuto.innerHTML = '';

  dati.categorie.forEach(cat => {
    const link = document.createElement('a');
    link.href = `#${cat.id}`;
    link.textContent = cat.label;
    indice.appendChild(link);

    const sezione = document.createElement('section');
    sezione.className = 'categoria';
    sezione.id = cat.id;

    const titolo = document.createElement('div');
    titolo.className = 'cat-titolo';
    titolo.innerHTML = `<h2>${escapeHtml(cat.label)}</h2>`;
    sezione.appendChild(titolo);

    if (!cat.items || cat.items.length === 0) {
      const vuoto = document.createElement('p');
      vuoto.className = 'vuoto';
      vuoto.textContent = 'Nessuna voce ancora inserita.';
      sezione.appendChild(vuoto);
    } else {
      const elenco = document.createElement('ul');
      elenco.className = 'elenco';
      cat.items.forEach(voce => {
        const li = document.createElement('li');

        const titoloVoce = document.createElement('div');
        titoloVoce.className = 'voce-titolo';
        if (voce.url) {
          const a = document.createElement('a');
          a.href = voce.url;
          a.textContent = voce.title;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          titoloVoce.appendChild(a);
        } else {
          titoloVoce.textContent = voce.title;
        }
        li.appendChild(titoloVoce);

        if (voce.year) {
          const meta = document.createElement('div');
          meta.className = 'voce-meta';
          meta.textContent = voce.year;
          li.appendChild(meta);
        }
        if (voce.note) {
          const nota = document.createElement('div');
          nota.className = 'voce-nota';
          nota.textContent = voce.note;
          li.appendChild(nota);
        }
        elenco.appendChild(li);
      });
      sezione.appendChild(elenco);
    }
    contenuto.appendChild(sezione);
  });

  document.getElementById('aggiornato').textContent =
    `Ultimo aggiornamento contenuti: ${new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}`;
}

function escapeHtml(testo) {
  const d = document.createElement('div');
  d.textContent = testo;
  return d.innerHTML;
}

caricaSito();
