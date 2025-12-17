const port = process.env.PORT || 3000;

refferences = [
    'https://www.exposeprofi.de/3d-visualisierungen/architekturvisualisierungen',
    'https://www.exposeprofi.de/3d-visualisierungen/innenvisualisierungen',
    'https://www.exposeprofi.de/3d-visualisierungen/3d-grundrisse',
    'https://www.exposeprofi.de/workflow/2d-grundriss-designs',
    'https://www.exposeprofi.de/digitales-home-staging',
    'https://www.exposeprofi.de/digitales-home-staging#referenzen-virtuelle-renovierung',
    'https://www.exposeprofi.de/3d-visualisierungen/virtuelle-rundgaenge',
    'https://www.exposeprofi.de/3d-visualisierungen/architekturvisualisierungen#referenzen-virtueller-videorundgang',
    'https://drive.google.com/file/d/1AW2T7wzx9-HxSOBx214YoM5MnXA3c8kp/view?usp=sharing',
    'https://www.exposeprofi.de/workflow/exposedesigns',

]

const serviceDescriptions = {
  'exterior-ground': {
    name: '3D-Außenvisualisierung Bodenperspektive',
    description: [
      'Geliefert werden XXX gerenderte Außenansichten des Objektes „XXX" aus den folgenden Bodenperspektiven (siehe rote Pfeile):',
      '○ xxx',
      'Fotorealistische Qualität',
      'Auf Wunsch eingefügt in von Ihnen zu liefernde Drohnenfotos oder schematische Modellierung der Umgebung',
      'Inkl. 1 Revisionsrunde⁽¹⁾',
      'Format: 2.500 x 1.500 px (300 DPI)',
      'Referenzen: KLICK'
    ],
    pricingTiers: [
      { quantity: 1, price: null, label: '1 Ansicht Netto:' },
      { quantity: 2, price: null, label: '2 Ansichten: Netto pro Ansicht:' },
      { quantity: 3, price: null, label: '3 Ansichten: Netto pro Ansicht:' },
      { quantity: 4, price: null, label: '4 Ansichten: Netto pro Ansicht:' },
      { quantity: 5, price: null, label: '5 Ansichten: Netto pro Ansicht:' }
    ]
  },
  'exterior-bird': {
    name: '3D-Außenvisualisierung Vogelperspektive',
    description: [
      'Geliefert wird 1x gerenderte Außenansicht des Objektes „XXX" aus der folgenden Vogelperspektive (siehe blauen Pfeil):',
      '○ xxx',
      'Fotorealistische Qualität',
      'Auf Wunsch eingefügt in von Ihnen zu liefernde Drohnenfotos oder schematische Modellierung der Umgebung',
      'Inkl. 1 Revisionsrunde⁽¹⁾',
      'Format: 2.500 x 1.500 px (300 DPI)',
      'Referenzen: KLICK',
      'Nur in Kombination mit allen im Angebot aufgeführten Bodenperspektiven verfügbar'
    ],
    pricingTiers: [
      { quantity: 1, price: null, label: '1 Ansicht Netto:' },
      { quantity: 2, price: null, label: '2 Ansichten: Netto pro Ansicht:' },
      { quantity: 3, price: null, label: '3 Ansichten: Netto pro Ansicht:' },
      { quantity: 4, price: null, label: '4 Ansichten: Netto pro Ansicht:' },
      { quantity: 5, price: null, label: '5 Ansichten: Netto pro Ansicht:' }
    ]
  },
  'interior': {
    name: '3D-Innenvisualisierung',
    description: [
      'Geliefert werden XX gerenderte Innenansichten der Räume:',
      '○ …',
      'Fotorealistische Qualität',
      'Eingerichtet individuell nach Ihren Wünschen (allerdings keine individuelle Modellierung konkreter Möbelstücke inkludiert)',
      'Falls Türen zwischen einzelnen Räumen zu sehen sind, werden diese als geschlossen dargestellt',
      'Inkl. 1 Revisionsrunde⁽¹⁾',
      'Format: 2.500 x 1.500 px (300 DPI)',
      'Referenzen: KLICK'
    ],
    pricingTiers: [
      { quantity: 1, price: 399, label: '1 Ansicht Netto: 399,00 €' },
      { quantity: 2, price: 299, label: '2 Ansichten: Netto pro Ansicht: 299,00 €' },
      { quantity: 3, price: 289, label: '3 Ansichten: Netto pro Ansicht: 289,00 €' },
      { quantity: 4, price: 269, label: '4 Ansichten: Netto pro Ansicht: 269,00 €' },
      { quantity: 5, price: 259, label: '5 Ansichten: Netto pro Ansicht: 259,00 €' },
      { quantity: 6, price: 249, label: '6 Ansichten: Netto pro Ansicht: 249,00 €' },
      { quantity: 7, price: 239, label: '7 Ansichten: Netto pro Ansicht: 239,00 €' },
      { quantity: 8, price: 229, label: '8 Ansichten: Netto pro Ansicht: 229,00 €' },
      { quantity: 9, price: 219, label: '9 Ansichten: Netto pro Ansicht: 219,00 €' },
      { quantity: 10, price: 199, label: '≥10 Ansichten: Netto pro Ansicht: 199,00 €' }
    ]
  },
  'terrace': {
    name: '3D-Visualisierung Terrasse',
    description: [
      'Geliefert wird 1x gerenderte Ansicht folgender Einheit:',
      '1x Terrasse (Whg. XX)',
      'Fotorealistische Qualität',
      'Eingerichtet individuell nach Ihren Wünschen (allerdings keine individuelle Modellierung konkreter Möbelstücke inkludiert)',
      'Inkl. 1 Revisionsrunde⁽¹⁾',
      'Format: 2.500 x 1.500 px (300 DPI)'
    ]
  },
  '3d-floorplan': {
    name: '3D-Grundriss',
    defaultPrice: 69.00,
    description: [
      'Geliefert werden XXX 3D-Grundrisse',
      'Hochwertig standardmöbliert',
      'Exklusive Qualität',
      'Inkl. 1 Revisionsrunde⁽¹⁾',
      '2.500px x 1.500 px bei 300 DPI',
      'Referenzen: KLICK'
    ]
  },
  '3d-complete-floor': {
    name: '3D-Geschossansicht',
    defaultPrice: 199.00,
    description: [
      'Geliefert werden XXX 3D-Geschossansichten folgender Einheiten',
      'XXX',
      'Hochwertig standardmöbliert',
      'Exklusive Qualität',
      'Inkl. 1 Revisionsrunde⁽¹⁾',
      '2.500px x 1.500 px bei 300 DPI'
    ]
  },
  '2d-floorplan': {
    name: '2D-Grundriss',
    defaultPrice: 49.00,
    description: [
      'Geliefert werden XXX 2D-Grundrisse',
      'Hochwertig standardmöbliert',
      'Exklusive Qualität',
      'Inkl. 1 Revisionsrunde⁽¹⁾',
      '2.500px x 1.500 px bei 300 DPI',
      'Referenzen: KLICK'
    ]
  },
  'home-staging': {
    name: 'Digital Home Staging',
    defaultPrice: 99.00,
    description: [
      'Geliefert werden XXX Digital Home Staging Fotos der Räume:',
      '○ text',
      'Basiert auf vom Kunden bereitgestellten Fotos',
      'Individuell eingerichtet',
      'Fotorealistische Qualität',
      'Exakt identische Perspektive wie zugrundeliegende Fotos',
      'Inkl. 1 Revisionsrunde⁽¹⁾',
      'Referenzen: KLICK'
    ]
  },
  'renovation': {
    name: 'Digitale Renovierung',
    defaultPrice: 139.00,
    description: [
      'Geliefert werden XXX Digitale Renovierungsfotos der Räume:',
      '○ text',
      'Basiert auf vom Kunden bereitgestellten Fotos',
      'Individuell eingerichtet',
      'Fotorealistische Qualität',
      'Exakt identische Perspektive wie zugrundeliegende Fotos',
      'Inkl. 1 Revisionsrunde⁽¹⁾',
      'Referenzen: KLICK'
    ]
  },
  '360-interior': {
    name: '360° Tour Innen',
    defaultPrice: 599.00,
    description: [
      'Geliefert wird 1x 360° Tour folgender Wohneinheit:',
      '○ text',
      'Begehung des kompletten Innenbereichs',
      'Individuell eingerichtet',
      'Einzigartige Technologie, da vollkommen frei bewegbar',
      'Intuitive Bedienung',
      'Passend für alle gängigen Endgeräte',
      'Inklusive Fensteraussicht (wahlweise mit beispielhafter oder Verwendung der tatsächlichen Aussicht mittels vom Auftraggeber gelieferten Bildern)',
      'Inkl. 2 Revisionsrunden⁽¹⁾',
      'Inkl. Hosting für 12 Monate⁽²⁾',
      'Referenz: KLICK'
    ]
  },
  '360-exterior': {
    name: '360° Video Außen',
    description: [
      'Geliefert wird 1x 360° Video-Tour des Objektes XXX',
      '(nur in Kombination mit mind. 2x 3D-Außenvisualisierung)',
      'Umgebung schematisch dargestellt',
      'Fotorealistische Qualität',
      'Länge ca. 90 Sekunden',
      'Inkl. 2 Revisionsrunden',
      'Referenz: KLICK'
    ]
  },
  'slideshow': {
    name: 'Slideshow Video',
    defaultPrice: 499.00,
    description: [
      'Geliefert wird XX Slideshow-Video des Objektes',
      'Inkl. aller Visualisierungen und weiterer Fotos',
      'Professionell vertont und kommentiert',
      'Inkl. Untertiteln',
      'Referenzen: KLICK'
    ]
  },
  'site-plan': {
    name: '3D-Lageplan',
    defaultPrice: 99.00,
    description: [
      'Geliefert wird XXX 3D-Lageplan des Objektes in Draufsicht',
      'Exklusive Qualität',
      'Inkl. 1 Revisionsrunde⁽¹⁾'
    ]
  },
  'social-media': {
    name: 'Social Media Paket',
    defaultPrice: 299.00,
    description: [
      'Geliefert wird 1x Social Media Paket für die Visualisierung des Objektes, bestehend aus:',
      'Alle statischen Visualisierungen in den für Social Media Posts passenden Formaten',
      'Video in passendem Format',
      'Fotorealistische Qualität'
    ]
  },
  'video-snippet': {
    name: 'Video Snippet Außen und Innen',
    defaultPrice: 299.00,
    description: [
      'Geliefert wird 1x Video-Snippet des Objektes, bei dem wir durch Unterstützung von künstlicher Intelligenz aus den statischen Innen- und Außenvisualisierungen ein Video mit Bewegtbildern erstellen',
      '(nur in Kombination mit mind. 2x Außen- und 2x Innenvisualisierung)',
      'Fotorealistische Qualität',
      'Basiert auf 2x Außen- und 2x Innenvisualisierungen',
      'Länge ca. 30 Sekunden, max 9 Fotos',
      'Da KI-generiert, keine Revisionsrunde'
    ]
  },
  'expose-layout': {
    name: 'Exposé Layout',
    defaultPrice: 1199.00,
    description: [
      'Geliefert wird XXX Exposé Layout für den Vertrieb des Objektes',
      'Nur in Kombination mit allen zuvor genannten Positionen erhältlich',
      'Layout und Farbkonzept nach Absprache, einfach gehalten',
      'Bestandteile (Beispiel-Aufbau): Inhaltsverzeichnis, Kurzbeschreibung Projekt, Lagebeschreibung, Bauvorhaben/Objektbeschreibung, Ausstattung, Grundrisse (inkl. m²- Angaben und evtl. Piktogramm für die Lage im Gebäude), Preistabelle und Finanzierung, Kontaktinformationen.',
      'Format: PPT',
      'Inkl. 2 Revisionsrunden',
      'Dient auch als Layout für weitere Projekte'
    ]
  },
  'expose-creation': {
    name: 'Exposé-Erstellung',
    defaultPrice: 499.00,
    description: [
      'Geliefert wird XXX komplettes Exposé für den Vertrieb des Objektes',
      'In druckfertiger, digitaler Ausführung',
      'Exklusive Qualität basierend auf gelieferten Texten und Informationen',
      'Nur in Kombination mit allen zuvor genannten Positionen erhältlich',
      'Alle Texte werden vom Kunden so zur Verfügung gestellt, dass Sie unverändert übernommen werden können',
      'Alle zusätzlich benötigten Fotos werden vom Kunden so zur Verfügung gestellt, dass Sie unverändert übernommen werden können',
      'Inkl. 2 Revisionsrunden',
      'Referenzen: KLICK'
    ]
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = serviceDescriptions;
}
if (typeof exports !== 'undefined') {
  exports.serviceDescriptions = serviceDescriptions;
}