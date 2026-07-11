// Default startpunkt for enhver ny tenant.

export default {
  pages: {
    home: {
      uid: "home",
      lang: "da-dk",
      title: "Forside",
      slices: [
        {
          type: "hero_simple",
          heading: "Velkommen",
          body: "Kort intro-tekst til hvad kunden tilbyder.",
          cta_text: "Kontakt",
          cta_url: "#",
          background_theme: "Lys",
        },
      ],
    },
  },
  navigation: {
    lang: "da-dk",
    title: "Navigation",
    language_selector: "Slået fra",
    slices: [
      {
        type: "header_classic",
        nav_items: [{ text: "Forside", url: "/" }],
        cta_url: "",
        cta_text: "",
      },
    ],
  },
  footer: {
    lang: "da-dk",
    title: "Footer",
    info_text: "Kort beskrivelse af virksomheden.",
    copyright: "Alle rettigheder forbeholdes",
    legal_links: [],
    columns: [],
    language_selector: "Slået fra",
    background_theme: "Mørk",
  },
  business: {
    lang: "da-dk",
    title: "Business",
    // Alle felter tomme — editor fylder ind
  },
  settings: {
    lang: "da-dk",
    title: "Indstillinger",
    // Alle felter tomme — Prismic default_value bruges (Europe/Copenhagen tidszone osv.)
  },
};
