let currentData = {
  colors: [],
  fonts: []
};

// Toast notification helper
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.innerText = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 1600);
}

// Copy helper
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied: ' + text);
  });
}

// Query Active Tab & Request Styles
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (!tabs[0] || !tabs[0].id) return;

  chrome.scripting.executeScript(
    {
      target: { tabId: tabs[0].id },
      files: ['content.js']
    },
    () => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'extractStyles' }, (response) => {
        if (!response) {
          document.getElementById('statusBadge').innerText = 'Failed';
          document.getElementById('statusBadge').style.color = '#ef4444';
          return;
        }

        currentData = response;
        renderColors(response.colors);
        renderFonts(response.fonts);
      });
    }
  );
});

// Render Extracted Colors
function renderColors(colors) {
  const container = document.getElementById('colorContainer');
  container.innerHTML = '';

  if (!colors || colors.length === 0) {
    container.innerHTML = '<div class="empty-text">No distinct colors found.</div>';
    return;
  }

  colors.forEach((hex) => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = hex;
    swatch.title = `${hex} (Click to copy)`;
    swatch.addEventListener('click', () => copyToClipboard(hex));
    container.appendChild(swatch);
  });
}

// Render Extracted Fonts
function renderFonts(fonts) {
  const container = document.getElementById('fontContainer');
  container.innerHTML = '';

  if (!fonts || fonts.length === 0) {
    container.innerHTML = '<div class="empty-text">No distinct fonts found.</div>';
    return;
  }

  fonts.forEach((f) => {
    const item = document.createElement('div');
    item.className = 'font-item';
    item.innerHTML = `
      <span style="font-weight: 600;">${f.family}</span>
      <span class="font-details">${f.weight} · ${f.size}</span>
    `;
    item.addEventListener('click', () => {
      const cssSnippet = `font-family: '${f.family}'; font-weight: ${f.weight}; font-size: ${f.size};`;
      copyToClipboard(cssSnippet);
    });
    container.appendChild(item);
  });
}

// Generate & Copy CSS Variables
document.getElementById('copyCssBtn').addEventListener('click', () => {
  if (currentData.colors.length === 0 && currentData.fonts.length === 0) {
    showToast('No style data to copy!');
    return;
  }

  let cssOutput = ':root {\n  /* Colors */\n';
  currentData.colors.forEach((hex, index) => {
    cssOutput += `  --color-${index + 1}: ${hex};\n`;
  });

  cssOutput += '\n  /* Typography */\n';
  currentData.fonts.forEach((f, index) => {
    cssOutput += `  --font-family-${index + 1}: '${f.family}', sans-serif;\n`;
    cssOutput += `  --font-size-${index + 1}: ${f.size};\n`;
    cssOutput += `  --font-weight-${index + 1}: ${f.weight};\n`;
  });
  cssOutput += '}\n';

  copyToClipboard(cssOutput);
  showToast('Copied CSS variables!');
});

// Save Style Kit to chrome.storage
document.getElementById('saveKitBtn').addEventListener('click', () => {
  const kitName = document.getElementById('kitNameInput').value.trim();
  if (!kitName) {
    alert('Please enter a kit name!');
    return;
  }

  chrome.storage.local.get({ savedKits: [] }, (data) => {
    const kits = data.savedKits;
    kits.push({
      id: Date.now(),
      name: kitName,
      colors: currentData.colors,
      fonts: currentData.fonts
    });

    chrome.storage.local.set({ savedKits: kits }, () => {
      document.getElementById('kitNameInput').value = '';
      loadSavedKits();
      showToast('Kit saved successfully!');
    });
  });
});

// Load Saved Kits from Storage
function loadSavedKits() {
  chrome.storage.local.get({ savedKits: [] }, (data) => {
    const container = document.getElementById('savedKitsContainer');
    container.innerHTML = '';

    if (data.savedKits.length === 0) {
      container.innerHTML = '<div class="empty-text">No kits saved yet.</div>';
      return;
    }

    data.savedKits.forEach((kit) => {
      const card = document.createElement('div');
      card.className = 'kit-card';
      card.innerHTML = `
        <strong>${kit.name}</strong>
        <div>
          <button class="btn secondary-btn" style="padding: 2px 6px; font-size: 10px;" id="copyKit-${kit.id}">Copy CSS</button>
        </div>
      `;

      card.querySelector(`#copyKit-${kit.id}`).addEventListener('click', () => {
        let kitCss = `:root {\n  /* ${kit.name} */\n`;
        kit.colors.forEach((hex, idx) => {
          kitCss += `  --color-${idx + 1}: ${hex};\n`;
        });
        kit.fonts.forEach((f, idx) => {
          kitCss += `  --font-${idx + 1}: '${f.family}', ${f.weight};\n`;
        });
        kitCss += '}\n';
        copyToClipboard(kitCss);
      });

      container.appendChild(card);
    });
  });
}

// Initial load
loadSavedKits();