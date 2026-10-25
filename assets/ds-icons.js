/*
 * Line icons standing in for the SF Symbols Birch uses. 24pt grid, 1.8 stroke,
 * drawn with currentColor. Names follow the SF Symbol each one replaces.
 */
;(function (root) {
  'use strict'

  const P = {
    'list.bullet.rectangle': '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M8 9.5h8M8 12.5h8M8 15.5h5"/>',
    'arrow.up.right': '<path d="M7 17 17 7M9 7h8v8"/>',
    'arrow.down.left': '<path d="M17 7 7 17M7 9v8h8"/>',
    'arrow.triangle.2.circlepath': '<path d="M4.5 11a7.5 7.5 0 0 1 13-4.2M17.5 3.5v3.6h-3.6M19.5 13a7.5 7.5 0 0 1-13 4.2M6.5 20.5v-3.6h3.6"/>',
    'bitcoinsign.circle': '<circle cx="12" cy="12" r="8.5"/><path d="M10 8v8M10 8h2.6a2 2 0 0 1 0 4H10m0 0h3a2 2 0 0 1 0 4h-3M11.4 6.6V8m0 8v1.4"/>',
    gearshape:
      '<circle cx="12" cy="12" r="2.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    'qrcode.viewfinder': '<path d="M4 8.5V5.5a1.5 1.5 0 0 1 1.5-1.5h3M15.5 4h3A1.5 1.5 0 0 1 20 5.5v3M20 15.5v3a1.5 1.5 0 0 1-1.5 1.5h-3M8.5 20h-3A1.5 1.5 0 0 1 4 18.5v-3"/><path d="M8.5 8.5h3v3h-3zM12.5 12.5h3v3h-3z"/>',
    qrcode: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5zM14 19v1M19 14h1"/>',
    'doc.on.clipboard': '<rect x="8.5" y="3" width="7" height="3.5" rx="1"/><path d="M8.5 5H6.5A1.5 1.5 0 0 0 5 6.5v12A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 17.5 5h-2"/>',
    'doc.on.doc': '<rect x="8.5" y="8.5" width="11" height="12" rx="2"/><path d="M5 15.5V6a2 2 0 0 1 2-2h8.5"/>',
    'chevron.right': '<path d="m9.5 6 6 6-6 6"/>',
    'chevron.left': '<path d="m14.5 6-6 6 6 6"/>',
    'chevron.down': '<path d="m6 9.5 6 6 6-6"/>',
    'chevron.up.chevron.down': '<path d="m8.5 9.5 3.5-3.5 3.5 3.5M8.5 14.5l3.5 3.5 3.5-3.5"/>',
    ellipsis: '<path d="M5.5 12h.01M12 12h.01M18.5 12h.01" stroke-width="3.2"/>',
    'checkmark.shield': '<path d="M12 3.2 19 6v5.6c0 4.4-2.9 7.6-7 9.2-4.1-1.6-7-4.8-7-9.2V6z"/><path d="m9 12 2.2 2.2L15.3 10"/>',
    'exclamationmark.triangle': '<path d="M10.3 4.4a2 2 0 0 1 3.4 0l7.2 12.4a2 2 0 0 1-1.7 3H4.8a2 2 0 0 1-1.7-3z"/><path d="M12 9.5v4M12 16.8h.01"/>',
    'xmark.octagon': '<path d="M8.2 3.5h7.6l4.7 4.7v7.6l-4.7 4.7H8.2l-4.7-4.7V8.2z"/><path d="m9.5 9.5 5 5m0-5-5 5"/>',
    'info.circle': '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
    checkmark: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    'checkmark.circle': '<circle cx="12" cy="12" r="8.5"/><path d="m8.3 12.3 2.5 2.5 4.9-5"/>',
    'lock.fill': '<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
    'lock.open': '<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 6.8-1.2"/>',
    signature: '<path d="M3.5 16.5c2.5-.8 3.6-7.5 5.6-7.5 1.8 0-.4 6.3 1.5 6.3 1.6 0 2-3.3 3.8-3.3 1.4 0 1.1 2.3 2.7 2.3 1 0 1.9-.6 3.4-1.6M3.5 20h17"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    tag: '<path d="M3.5 12.3V4.5a1 1 0 0 1 1-1h7.8l8.2 8.2a1.4 1.4 0 0 1 0 2l-6.8 6.8a1.4 1.4 0 0 1-2 0z"/><path d="M8 8h.01" stroke-width="2.6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    'plus.circle': '<circle cx="12" cy="12" r="8.5"/><path d="M12 8.5v7M8.5 12h7"/>',
    xmark: '<path d="M6.5 6.5l11 11m0-11-11 11"/>',
    'xmark.circle': '<circle cx="12" cy="12" r="8.5"/><path d="m9.5 9.5 5 5m0-5-5 5"/>',
    printer: '<path d="M7 9V4h10v5M7 17H5.5A1.5 1.5 0 0 1 4 15.5v-5A1.5 1.5 0 0 1 5.5 9h13a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5H17"/><path d="M7 14h10v6H7z"/>',
    'square.and.arrow.up': '<path d="M12 14.5V3.5M8.5 7 12 3.5 15.5 7M8 10H6.5A1.5 1.5 0 0 0 5 11.5v7A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-7a1.5 1.5 0 0 0-1.5-1.5H16"/>',
    'tray.and.arrow.down': '<path d="M12 3.5v10M8.5 10l3.5 3.5 3.5-3.5M4 14v4.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V14"/>',
    bookmark: '<path d="M6.5 4.5A1 1 0 0 1 7.5 3.5h9a1 1 0 0 1 1 1v15.6l-5.5-3.8-5.5 3.8z"/>',
    'server.rack': '<rect x="4" y="4.5" width="16" height="6.5" rx="1.5"/><rect x="4" y="13" width="16" height="6.5" rx="1.5"/><path d="M7.5 7.8h.01M7.5 16.2h.01" stroke-width="2.6"/>',
    'slider.horizontal.3': '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    leaf: '<path d="M5 19.5C5 11 10.2 4.8 19.5 4.5c-.2 9.5-6.5 15-14.5 15z"/><path d="M5 19.5 13.5 11"/>',
    'text.bubble': '<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7.5L6 20v-4a2 2 0 0 1-2-2z"/><path d="M8 8.5h8M8 11.5h5"/>',
    'sun.max': '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    'moon': '<path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1z"/>',
    'circle.lefthalf.filled': '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 1 0-17z" fill="currentColor"/>',
    'arrow.down.to.line': '<path d="M12 3.5v11M8 10.5l4 4 4-4M5 20h14"/>',
    trash: '<path d="M4.5 6.5h15M9.5 6.5V4.5h5v2M6.5 6.5l1 13h9l1-13"/>',
    'rectangle.split.3x1': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M9 5v14M15 5v14"/>',
    'rectangle.portrait': '<rect x="6" y="3" width="12" height="18" rx="2.5"/>',
    'arrow.counterclockwise': '<path d="M5 12a7 7 0 1 0 2.1-5M5 4v4h4"/>',
    'pencil': '<path d="M15.5 4.5l4 4L9 19H5v-4z"/>',
    'antenna': '<path d="M12 12v8.5M8.5 20.5h7"/><circle cx="12" cy="10" r="1.6"/><path d="M8.2 6.3a5.3 5.3 0 0 0 0 7.4M15.8 6.3a5.3 5.3 0 0 1 0 7.4M5.5 3.8a9 9 0 0 0 0 12.4M18.5 3.8a9 9 0 0 1 0 12.4"/>',
    'arrow.up.arrow.down': '<path d="M8 19V5M4.5 8.5 8 5l3.5 3.5M16 5v14m-3.5-3.5L16 19l3.5-3.5"/>',
    'faceid': '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M9 9.5v1.5M15 9.5v1.5M12 9.5v3.5h-1M9.5 15.5a3.5 3.5 0 0 0 5 0"/>',
    'eye': '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    magnifyingglass: '<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/>',
    'arrow.uturn.backward': '<path d="M9 14 4.5 9.5 9 5M4.5 9.5H15a5 5 0 0 1 0 10h-3"/>',
  }

  function icon(name, size = 20, cls = '') {
    const d = P[name]
    if (!d) return ''
    return `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${d}</svg>`
  }

  root.BirchIcons = { icon, names: Object.keys(P) }
})(typeof window !== 'undefined' ? window : globalThis)
