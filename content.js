(() => {
  function rgbToHex(rgbStr) {
    if (!rgbStr || rgbStr === 'transparent' || rgbStr === 'rgba(0, 0, 0, 0)') {
      return null;
    }
    const match = rgbStr.match(/\d+/g);
    if (!match || match.length < 3) return null;
    
    // Convert RGB to HEX
    const r = parseInt(match[0]).toString(16).padStart(2, '0');
    const g = parseInt(match[1]).toString(16).padStart(2, '0');
    const b = parseInt(match[2]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toUpperCase();
  }

  function extractPageStyles() {
    const elements = Array.from(document.querySelectorAll('body *'));
    const colorCounts = {};
    const fontSet = new Set();
    const fontsList = [];

    elements.forEach((el) => {
      // Element jodi display: none ba hidden thake sheta skip kora hobe
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return;
      }

      // Background Color
      const bgHex = rgbToHex(style.backgroundColor);
      if (bgHex) {
        colorCounts[bgHex] = (colorCounts[bgHex] || 0) + 1;
      }

      // Text Color
      const textHex = rgbToHex(style.color);
      if (textHex && el.innerText && el.innerText.trim().length > 0) {
        colorCounts[textHex] = (colorCounts[textHex] || 0) + 1;
      }

      // Fonts
      const fontFamily = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
      const fontWeight = style.fontWeight;
      const fontSize = style.fontSize;

      if (fontFamily && el.innerText && el.innerText.trim().length > 0) {
        const fontKey = `${fontFamily}|${fontWeight}|${fontSize}`;
        if (!fontSet.has(fontKey)) {
          fontSet.add(fontKey);
          fontsList.push({
            family: fontFamily,
            weight: fontWeight,
            size: fontSize,
            tag: el.tagName.toLowerCase()
          });
        }
      }
    });

    // Rank colors by frequency of occurrence
    const sortedColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    return {
      colors: sortedColors.slice(0, 10), // Top 10 dominant colors
      fonts: fontsList.slice(0, 6)        // Distinct font styles
    };
  }

  // Listener to respond to popup request
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractStyles') {
      const result = extractPageStyles();
      sendResponse(result);
    }
    return true;
  });
})();