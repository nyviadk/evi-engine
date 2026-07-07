// Delt persona-data for alle slice-preview mock.ts filer.
//
// KUN til slice-preview-generering — aldrig i produktion. Alle "kontakt-
// lignende" felter (domain, address, phone, email, CVR) er BEVIDST bygget
// så de umuligt kan forveksles med ægte data:
//   - domain bruger .example TLD (RFC 2606 reserverer den til dokumentation)
//   - phone/CVR er kun nuller
//   - address peger på "Preview Vej" / postnummer 0000
//   - email bruger .example TLD
//
// Brand-navn og indhold må gerne lyde realistisk (det er hele pointen med
// et preview) — men enhver bruger der ser dataen skal med det samme forstå
// at det er syntetisk.

export const PERSONA = {
  brand: "Kaffemølle Aarhus",
  tagline: "Vi rister vores egen kaffe — hver dag siden 2018.",

  // Alt herunder er BEVIDST utvetydig mock-data (.example TLD, nul-tal).
  domain: "kaffemolle.example",
  contact: {
    address: "Preview Vej 42, 0000 NyviaEvi",
    phone: "+45 00 00 00 00",
    email: "hej@kaffemolle.example",
    cvr: "00000000",
  },

  hours: [
    "Mandag–fredag 07:00–18:00",
    "Lørdag 08:00–16:00",
    "Søndag 09:00–15:00",
  ],

  legal_entity: "NyviaEvi Preview",

  nav: {
    top: ["Kaffe", "Bønner", "Om os", "Blog", "Kontakt"],
    products: ["Kaffedrikke", "Espressobar", "Filterkaffe", "Kaffebønner"],
    shop: ["Brygudstyr", "Gavekort", "Abonnement", "Kurser"],
    about: ["Vores historie", "Kaffefarmerne", "Bæredygtighed", "Presse"],
    legal: ["Privatlivspolitik", "Servicevilkår", "Cookies"],
  },
} as const;
