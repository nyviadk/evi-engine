import type * as prismic from "@prismicio/client";

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };


type PickContentRelationshipFieldData<
	TRelationship extends prismic.CustomTypeModelFetchCustomTypeLevel1 | prismic.CustomTypeModelFetchCustomTypeLevel2 | prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2,
	TData extends Record<string, prismic.AnyRegularField | prismic.GroupField | prismic.NestedGroupField | prismic.SliceZone>,
	TLang extends string
> = |
	// Content relationship fields
	{
		[TSubRelationship in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchContentRelationshipLevel1
		> as TSubRelationship["id"]]:
			ContentRelationshipFieldWithData<TSubRelationship["customtypes"], TLang>;
	} &
	// Group
	{
		[TGroup in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2
		> as TGroup["id"]]:
			TData[TGroup["id"]] extends prismic.GroupField<infer TGroupData>
				? prismic.GroupField<PickContentRelationshipFieldData<TGroup, TGroupData, TLang>>
				: never
	} &
	// Other fields
	{
		[TFieldKey in Extract<TRelationship["fields"][number], string>]:
			TFieldKey extends keyof TData ? TData[TFieldKey] : never;
	};

type ContentRelationshipFieldWithData<
	TCustomType extends readonly (prismic.CustomTypeModelFetchCustomTypeLevel1 | string)[] | readonly (prismic.CustomTypeModelFetchCustomTypeLevel2 | string)[],
	TLang extends string = string
> = {
	[ID in Exclude<TCustomType[number], string>["id"]]:
		prismic.ContentRelationshipField<
			ID,
			TLang,
			PickContentRelationshipFieldData<
				Extract<TCustomType[number], { id: ID }>,
				Extract<prismic.Content.AllDocumentTypes, { type: ID }>["data"],
				TLang
			>
		>
}[Exclude<TCustomType[number], string>["id"]];

/**
 * Item in *Business → Sociale profiler (sameAs)*
 */
export interface BusinessDocumentDataSocialProfilesItem {
	/**
	 * Platform field in *Business → Sociale profiler (sameAs)*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Vælg medie...
	 * - **API ID Path**: business.social_profiles[].platform
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	platform: prismic.SelectField<"LinkedIn" | "Facebook" | "Instagram" | "YouTube" | "X" | "Wikipedia">;
	
	/**
	 * Profil URL field in *Business → Sociale profiler (sameAs)*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: https://linkedin.com/company/dit-brand
	 * - **API ID Path**: business.social_profiles[].profile_url
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	profile_url: prismic.KeyTextField;
}

/**
 * Content for Business documents
 */
interface BusinessDocumentData {
	/**
	 * Virksomhedstype field in *Business*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Vælg type...
	 * - **API ID Path**: business.schema_type
	 * - **Tab**: Stamdata
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	schema_type: prismic.SelectField<"Organization" | "LocalBusiness" | "Person" | "Corporation">;
	
	/**
	 * Juridisk navn field in *Business*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Skal matche evt. CVR
	 * - **API ID Path**: business.legal_name
	 * - **Tab**: Stamdata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	legal_name: prismic.KeyTextField;
	
	/**
	 * Alternativt navn field in *Business*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: F.eks. forkortelse
	 * - **API ID Path**: business.alternate_name
	 * - **Tab**: Stamdata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	alternate_name: prismic.KeyTextField;
	
	/**
	 * CVR Nummer field in *Business*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: F.eks. 12345678
	 * - **API ID Path**: business.vat_id
	 * - **Tab**: Stamdata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	vat_id: prismic.KeyTextField;
	
	/**
	 * Logo (Min. 112x112px, hvid bg) field in *Business*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: business.brand_logo
	 * - **Tab**: Stamdata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	brand_logo: prismic.ImageField<never>;
	
	/**
	 * Kort beskrivelse field in *Business*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: En ultrakort, faktuel beskrivelse af virksomheden...
	 * - **API ID Path**: business.description
	 * - **Tab**: Stamdata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	description: prismic.KeyTextField;/**
	 * Global email field in *Business*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: F.eks. kontakt@virksomhed.dk
	 * - **API ID Path**: business.contact_email
	 * - **Tab**: Kontakt & social
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	contact_email: prismic.KeyTextField;
	
	/**
	 * Global telefon field in *Business*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: F.eks. +45 12 34 56 78
	 * - **API ID Path**: business.global_telephone
	 * - **Tab**: Kontakt & social
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	global_telephone: prismic.KeyTextField;
	
	/**
	 * Sociale profiler (sameAs) field in *Business*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: business.social_profiles[]
	 * - **Tab**: Kontakt & social
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	social_profiles: prismic.GroupField<Simplify<BusinessDocumentDataSocialProfilesItem>>;/**
	 * Schema mode (Kill Switch) field in *Business*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Auto (Virksomhed + Brødkrummer)
	 * - **API ID Path**: business.schema_mode
	 * - **Tab**: Avanceret SEO
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	schema_mode: prismic.SelectField<"Auto (Virksomhed + Brødkrummer)" | "Kun brødkrummer" | "Deaktiver alt (kun Custom JSON)", "filled">;
	
	/**
	 * Custom JSON-LD (Power User) field in *Business*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Indsæt valid JSON-LD kode her. Brug kun hvis du ved, hvad du laver!
	 * - **API ID Path**: business.custom_schema_json
	 * - **Tab**: Avanceret SEO
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	custom_schema_json: prismic.KeyTextField;
	
	/**
	 * FAQ-schema (Bing + AI-svarmaskiner) field in *Business*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Ja
	 * - **API ID Path**: business.faq_schema
	 * - **Tab**: Avanceret SEO
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	faq_schema: prismic.SelectField<"Ja" | "Nej", "filled">;
}

/**
 * Business document from Prismic
 *
 * - **API ID**: `business`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type BusinessDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<BusinessDocumentData>, "business", Lang>;

type FooterDocumentDataColumnsSlice = FooterColumnLinksSlice | FooterColumnTextSlice

/**
 * Content for Footer documents
 */
interface FooterDocumentData {
	/**
	 * Logo field in *Footer*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Valgfri — 48px høj, fri bredde. Tom = sitenavn som tekst
	 * - **API ID Path**: footer.logo
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	logo: prismic.ImageField<never>;
	
	/**
	 * Virksomhedstekst field in *Footer*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort tekst under logo (fx tagline eller mission)
	 * - **API ID Path**: footer.info_text
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	info_text: prismic.RichTextField;
	
	/**
	 * Kolonner field in *Footer*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: footer.columns[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	columns: prismic.SliceZone<FooterDocumentDataColumnsSlice>;
	
	/**
	 * Copyright-navn field in *Footer*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: fx Firmanavn — © og år tilføjes automatisk
	 * - **API ID Path**: footer.copyright
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	copyright: prismic.RichTextField;
	
	/**
	 * Juridiske links field in *Footer*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: footer.legal_links
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	legal_links: prismic.Repeatable<prismic.LinkField<string, string, unknown, prismic.FieldState, never>>;
	
	/**
	 * Sprogvælger field in *Footer*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Vises kun hvis tenant har flere sprog
	 * - **Default Value**: Slået fra
	 * - **API ID Path**: footer.language_selector
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	language_selector: prismic.SelectField<"Slået fra" | "Slået til", "filled">;
	
	/**
	 * Baggrundstema field in *Footer*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Baggrundstema for hele footeren
	 * - **Default Value**: Lys
	 * - **API ID Path**: footer.background_theme
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Footer document from Prismic
 *
 * - **API ID**: `footer`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type FooterDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<FooterDocumentData>, "footer", Lang>;

type NavigationDocumentDataSlicesSlice = HeaderClassicSlice

/**
 * Content for Navigation documents
 */
interface NavigationDocumentData {
	/**
	 * Slice Zone field in *Navigation*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: navigation.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<NavigationDocumentDataSlicesSlice>;
	
	/**
	 * Sprogvælger field in *Navigation*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Vises kun hvis tenant har flere sprog
	 * - **Default Value**: Slået fra
	 * - **API ID Path**: navigation.language_selector
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	language_selector: prismic.SelectField<"Slået fra" | "Slået til", "filled">;
	
	/**
	 * Mobil-menu breakpoint field in *Navigation*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Hvornaar nav'en vises som fuld raekke i stedet for hamburger (vaelg efter antal/laengde af links)
	 * - **Default Value**: Standard
	 * - **API ID Path**: navigation.mobile_nav_breakpoint
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	mobile_nav_breakpoint: prismic.SelectField<"Kompakt" | "Standard" | "Bred" | "Meget bred" | "Ekstra bred", "filled">;
}

/**
 * Navigation document from Prismic
 *
 * - **API ID**: `navigation`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type NavigationDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<NavigationDocumentData>, "navigation", Lang>;

type PageDocumentDataSlicesSlice = HeroSlice | FeaturesSlice | FaqSlice | HighlightsSlice | PhoneMockupSlice | TestimonialsSlice | TextWithImagesSlice | CaseStudiesSlice | PricesSlice | GallerySlice | MapsSlice | ProfileSlice | TextContentSlice

/**
 * Content for Side documents
 */
interface PageDocumentData {
	/**
	 * Forældre side field in *Side*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page.parent_page
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	parent_page: prismic.ContentRelationshipField<"page">;
	
	/**
	 * Slice Zone field in *Side*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<PageDocumentDataSlicesSlice>;/**
	 * SEO titel field in *Side*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Vises i Google og i browser-fanen
	 * - **API ID Path**: page.meta_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * SEO beskrivelse field in *Side*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Den lille tekst der vises under linket i Google
	 * - **API ID Path**: page.meta_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Billede (Sociale Medier) field in *Side*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page.meta_image
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	meta_image: prismic.ImageField<never>;
	
	/**
	 * Skjul siden fra Google (noindex) field in *Side*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: page.noindex
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	noindex: prismic.BooleanField;
	
	/**
	 * Canonical URL (avanceret) field in *Side*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Kun hvis siden skal pege på en anden URL i Google
	 * - **API ID Path**: page.canonical_override
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	canonical_override: prismic.KeyTextField;
}

/**
 * Side document from Prismic
 *
 * - **API ID**: `page`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type PageDocument<Lang extends string = string> = prismic.PrismicDocumentWithUID<Simplify<PageDocumentData>, "page", Lang>;

/**
 * Item in *Indstillinger → Viderestillinger*
 */
export interface SettingsDocumentDataRedirectsItem {
	/**
	 * Fra URL field in *Indstillinger → Viderestillinger*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: f.eks. /sommer
	 * - **API ID Path**: settings.redirects[].from_url
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	from_url: prismic.KeyTextField;
	
	/**
	 * Til URL field in *Indstillinger → Viderestillinger*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: f.eks. /tilbud
	 * - **API ID Path**: settings.redirects[].to_url
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	to_url: prismic.KeyTextField;
	
	/**
	 * Hvorfor laver du dette link? field in *Indstillinger → Viderestillinger*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: 301 (siden er slettet/flyttet for altid)
	 * - **API ID Path**: settings.redirects[].redirect_type
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	redirect_type: prismic.SelectField<"301 (siden er slettet/flyttet for altid)" | "307 (dette er blot en midlertidig genvej)", "filled">;
}

/**
 * Content for Indstillinger documents
 */
interface SettingsDocumentData {
	/**
	 * Sidenavn field in *Indstillinger*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: F.eks. Jensen Frisør
	 * - **API ID Path**: settings.site_name
	 * - **Tab**: Generelt
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	site_name: prismic.KeyTextField;
	
	/**
	 * Tving sprog i URL? (fx /da-dk) field in *Indstillinger*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: settings.force_lang_prefix
	 * - **Tab**: Generelt
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	force_lang_prefix: prismic.BooleanField;
	
	/**
	 * Standard billede (sociale medier) field in *Indstillinger*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.default_og_image
	 * - **Tab**: Generelt
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	default_og_image: prismic.ImageField<never>;
	
	/**
	 * Favicon — mørkt ikon (til lyst tema) field in *Indstillinger*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Mørk streg/logo — vises på browserens LYSE faneblad
	 * - **API ID Path**: settings.favicon_light
	 * - **Tab**: Generelt
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	favicon_light: prismic.ImageField<never>;
	
	/**
	 * Favicon — lyst ikon (til mørkt tema) field in *Indstillinger*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Lys streg/logo — vises på browserens MØRKE faneblad
	 * - **API ID Path**: settings.favicon_dark
	 * - **Tab**: Generelt
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	favicon_dark: prismic.ImageField<never>;
	
	/**
	 * Tidszone field in *Indstillinger*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Kundens tidszone
	 * - **Default Value**: Europe/Copenhagen
	 * - **API ID Path**: settings.timezone
	 * - **Tab**: Generelt
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	timezone: prismic.SelectField<"Europe/Copenhagen" | "Europe/Oslo" | "Europe/Stockholm" | "Europe/Helsinki" | "Europe/Berlin" | "Europe/London" | "UTC", "filled">;
	
	/**
	 * Tillad oversættelse af sitenavn (fx Google Translate) field in *Indstillinger*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.translate_brand
	 * - **Tab**: Generelt
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	translate_brand: prismic.BooleanField;/**
	 * Lys farve field in *Indstillinger*
	 *
	 * - **Field Type**: Color
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.color_light
	 * - **Tab**: Udseende og layout
	 * - **Documentation**: https://prismic.io/docs/fields/color
	 */
	color_light: prismic.ColorField;
	
	/**
	 * Mørk farve field in *Indstillinger*
	 *
	 * - **Field Type**: Color
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.color_dark
	 * - **Tab**: Udseende og layout
	 * - **Documentation**: https://prismic.io/docs/fields/color
	 */
	color_dark: prismic.ColorField;
	
	/**
	 * Primær brandfarve field in *Indstillinger*
	 *
	 * - **Field Type**: Color
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.color_primary
	 * - **Tab**: Udseende og layout
	 * - **Documentation**: https://prismic.io/docs/fields/color
	 */
	color_primary: prismic.ColorField;
	
	/**
	 * Sekundær brandfarve field in *Indstillinger*
	 *
	 * - **Field Type**: Color
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.color_secondary
	 * - **Tab**: Udseende og layout
	 * - **Documentation**: https://prismic.io/docs/fields/color
	 */
	color_secondary: prismic.ColorField;
	
	/**
	 * Layoutbredde field in *Indstillinger*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Bredden på dit hjemmesideindhold
	 * - **API ID Path**: settings.layout_width
	 * - **Tab**: Udseende og layout
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	layout_width: prismic.SelectField<"Klassisk (1200px)" | "Standard (1280px)" | "Komfort (1360px)" | "Moderne (1440px)" | "Ekspansiv (1664px)" | "Cinematic (1920px)">;
	
	/**
	 * Hjørner / radius field in *Indstillinger*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Hvor skarpe eller bløde kanterne skal være på fx kasser og billeder
	 * - **API ID Path**: settings.border_radius
	 * - **Tab**: Udseende og layout
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	border_radius: prismic.SelectField<"Skarpe hjørner (0px)" | "Lille afrunding (4px)" | "Standard (8px)" | "Blød (16px)" | "Pilleformet (fuld radius)">;
	
	/**
	 * Skrifttype (anbefalet - hurtig) field in *Indstillinger*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Vælg en optimeret skrifttype
	 * - **Default Value**: System standard
	 * - **API ID Path**: settings.font_select
	 * - **Tab**: Udseende og layout
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	font_select: prismic.SelectField<"System standard" | "Montserrat" | "Rethink Sans" | "Comfortaa" | "Poppins" | "Abel" | "Roboto" | "Open Sans" | "Inter" | "Lato" | "Plus Jakarta Sans", "filled">;
	
	/**
	 * Avanceret skrifttype (Bunny Fonts) field in *Indstillinger*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Navn fra fonts.bunny.net (f.eks. "Playfair Display"). Dette felt overstyrer valget ovenfor.
	 * - **API ID Path**: settings.custom_font_input
	 * - **Tab**: Udseende og layout
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	custom_font_input: prismic.KeyTextField;
	
	/**
	 * Browser-tema (scrollbars + formularer) field in *Indstillinger*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Hvilket tema browseren tilpasser sine egne kontroller til
	 * - **Default Value**: Lys
	 * - **API ID Path**: settings.color_scheme
	 * - **Tab**: Udseende og layout
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	color_scheme: prismic.SelectField<"Lys" | "Mørk" | "Lys & mørk (auto)", "filled">;
	
	/**
	 * Tekststørrelse field in *Indstillinger*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Standard (16px)
	 * - **API ID Path**: settings.text_scale
	 * - **Tab**: Udseende og layout
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	text_scale: prismic.SelectField<"Standard (16px)" | "Stor (18px)" | "Ekstra stor (20px)", "filled">;
	
	/**
	 * Papir-tekstur field in *Indstillinger*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Subtil kornet overflade over hele sitet
	 * - **Default Value**: Fra
	 * - **API ID Path**: settings.paper_grain
	 * - **Tab**: Udseende og layout
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	paper_grain: prismic.SelectField<"Fra" | "Til", "filled">;/**
	 * Viderestillinger field in *Indstillinger*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.redirects[]
	 * - **Tab**: Viderestillinger
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	redirects: prismic.GroupField<Simplify<SettingsDocumentDataRedirectsItem>>;
}

/**
 * Indstillinger document from Prismic
 *
 * - **API ID**: `settings`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type SettingsDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<SettingsDocumentData>, "settings", Lang>;

export type AllDocumentTypes = BusinessDocument | FooterDocument | NavigationDocument | PageDocument | SettingsDocument;

/**
 * Item in *CaseStudies → Default → Primary → Cases*
 */
export interface CaseStudiesSliceDefaultPrimaryCasesItem {
	/**
	 * Billede field in *CaseStudies → Default → Primary → Cases*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Liggende billede (4:3)
	 * - **API ID Path**: case_studies.default.primary.cases[].image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
	
	/**
	 * Titel field in *CaseStudies → Default → Primary → Cases*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Casens titel
	 * - **API ID Path**: case_studies.default.primary.cases[].title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Beskrivelse field in *CaseStudies → Default → Primary → Cases*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort beskrivelse af casen
	 * - **API ID Path**: case_studies.default.primary.cases[].description
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	description: prismic.RichTextField;
	
	/**
	 * 2 kolonner: label + værdi field in *CaseStudies → Default → Primary → Cases*
	 *
	 * - **Field Type**: Table
	 * - **Placeholder**: *None*
	 * - **API ID Path**: case_studies.default.primary.cases[].meta
	 * - **Documentation**: https://prismic.io/docs/fields/table
	 */
	meta: prismic.TableField;
	
	/**
	 * Læs mere-link field in *CaseStudies → Default → Primary → Cases*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: case_studies.default.primary.cases[].cta_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	cta_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Primary content in *CaseStudies → Default → Primary*
 */
export interface CaseStudiesSliceDefaultPrimary {
	/**
	 * Overskrift field in *CaseStudies → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Sektionens overskrift
	 * - **API ID Path**: case_studies.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Brødtekst field in *CaseStudies → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort intro under overskriften
	 * - **API ID Path**: case_studies.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Overskrift-justering field in *CaseStudies → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Venstre
	 * - **API ID Path**: case_studies.default.primary.heading_align
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	heading_align: prismic.SelectField<"Venstre" | "Centreret", "filled">;
	
	/**
	 * Cases field in *CaseStudies → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: case_studies.default.primary.cases[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	cases: prismic.GroupField<Simplify<CaseStudiesSliceDefaultPrimaryCasesItem>>;
	
	/**
	 * Læs alle-tekst field in *CaseStudies → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx Læs alle
	 * - **API ID Path**: case_studies.default.primary.more_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	more_label: prismic.KeyTextField;
	
	/**
	 * Baggrundstema field in *CaseStudies → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Lys
	 * - **API ID Path**: case_studies.default.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Default variation for CaseStudies Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type CaseStudiesSliceDefault = prismic.SharedSliceVariation<"default", Simplify<CaseStudiesSliceDefaultPrimary>, never>;

/**
 * Slice variation for *CaseStudies*
 */
type CaseStudiesSliceVariation = CaseStudiesSliceDefault

/**
 * CaseStudies Shared Slice
 *
 * - **API ID**: `case_studies`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type CaseStudiesSlice = prismic.SharedSlice<"case_studies", CaseStudiesSliceVariation>;

/**
 * Item in *Faq → Default → Primary → Spørgsmål*
 */
export interface FaqSliceDefaultPrimaryItemsItem {
	/**
	 * Spørgsmål field in *Faq → Default → Primary → Spørgsmål*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: faq.default.primary.items[].question
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	question: prismic.RichTextField;
	
	/**
	 * Svar field in *Faq → Default → Primary → Spørgsmål*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: faq.default.primary.items[].answer
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	answer: prismic.RichTextField;
}

/**
 * Primary content in *Faq → Default → Primary*
 */
export interface FaqSliceDefaultPrimary {
	/**
	 * Overskrift field in *Faq → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: faq.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Brødtekst field in *Faq → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: faq.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Overskrift-justering field in *Faq → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Centreret
	 * - **API ID Path**: faq.default.primary.heading_align
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	heading_align: prismic.SelectField<"Venstre" | "Centreret", "filled">;
	
	/**
	 * Overskrift: knap (valgfri) field in *Faq → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: faq.default.primary.cta_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	cta_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Spørgsmål field in *Faq → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: faq.default.primary.items[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	items: prismic.GroupField<Simplify<FaqSliceDefaultPrimaryItemsItem>>;
	
	/**
	 * Baggrundstema field in *Faq → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Lys
	 * - **API ID Path**: faq.default.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Default variation for Faq Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FaqSliceDefault = prismic.SharedSliceVariation<"default", Simplify<FaqSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Faq*
 */
type FaqSliceVariation = FaqSliceDefault

/**
 * Faq Shared Slice
 *
 * - **API ID**: `faq`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FaqSlice = prismic.SharedSlice<"faq", FaqSliceVariation>;

/**
 * Item in *Features → Cards → Primary → Kort*
 */
export interface FeaturesSliceCardsPrimaryCardsItem {
	/**
	 * Ikon field in *Features → Cards → Primary → Kort*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Iconify-navn, fx lucide:brain
	 * - **API ID Path**: features.cards.primary.cards[].icon
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	icon: prismic.KeyTextField;
	
	/**
	 * Overskrift field in *Features → Cards → Primary → Kort*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort titel
	 * - **API ID Path**: features.cards.primary.cards[].heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Tekst field in *Features → Cards → Primary → Kort*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort beskrivelse
	 * - **API ID Path**: features.cards.primary.cards[].body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
}

/**
 * Item in *Features → Split → Primary → Bokse*
 */
export interface FeaturesSliceSplitPrimaryFeaturesItem {
	/**
	 * Ikon field in *Features → Split → Primary → Bokse*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Iconify-navn, fx lucide:check
	 * - **API ID Path**: features.split.primary.features[].icon
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	icon: prismic.KeyTextField;
	
	/**
	 * Overskrift field in *Features → Split → Primary → Bokse*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Boks-titel
	 * - **API ID Path**: features.split.primary.features[].heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Tekst field in *Features → Split → Primary → Bokse*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort beskrivelse
	 * - **API ID Path**: features.split.primary.features[].body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
}

/**
 * Primary content in *Features → Default → Primary*
 */
export interface FeaturesSliceDefaultPrimary {
	/**
	 * Kolonne 1: ikon field in *Features → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Iconify-navn, fx lucide:badge-check
	 * - **API ID Path**: features.default.primary.feature_1_icon
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	feature_1_icon: prismic.KeyTextField;
	
	/**
	 * Kolonne 1: tekst field in *Features → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: features.default.primary.feature_1_text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	feature_1_text: prismic.RichTextField;
	
	/**
	 * Kolonne 2: ikon field in *Features → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Iconify-navn, fx lucide:badge-check
	 * - **API ID Path**: features.default.primary.feature_2_icon
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	feature_2_icon: prismic.KeyTextField;
	
	/**
	 * Kolonne 2: tekst field in *Features → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: features.default.primary.feature_2_text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	feature_2_text: prismic.RichTextField;
	
	/**
	 * Kolonne 3: ikon field in *Features → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Iconify-navn, fx lucide:badge-check
	 * - **API ID Path**: features.default.primary.feature_3_icon
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	feature_3_icon: prismic.KeyTextField;
	
	/**
	 * Kolonne 3: tekst field in *Features → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: features.default.primary.feature_3_text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	feature_3_text: prismic.RichTextField;
	
	/**
	 * Kolonne 4: ikon field in *Features → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Iconify-navn, fx lucide:badge-check
	 * - **API ID Path**: features.default.primary.feature_4_icon
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	feature_4_icon: prismic.KeyTextField;
	
	/**
	 * Kolonne 4: tekst field in *Features → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: features.default.primary.feature_4_text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	feature_4_text: prismic.RichTextField;
	
	/**
	 * Baggrundstema field in *Features → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Lys
	 * - **API ID Path**: features.default.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Default variation for Features Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FeaturesSliceDefault = prismic.SharedSliceVariation<"default", Simplify<FeaturesSliceDefaultPrimary>, never>;

/**
 * Primary content in *Features → Cards → Primary*
 */
export interface FeaturesSliceCardsPrimary {
	/**
	 * Overskrift field in *Features → Cards → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Sektionens overskrift
	 * - **API ID Path**: features.cards.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Brødtekst field in *Features → Cards → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort intro under overskriften
	 * - **API ID Path**: features.cards.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Overskrift-justering field in *Features → Cards → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Centreret
	 * - **API ID Path**: features.cards.primary.heading_align
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	heading_align: prismic.SelectField<"Venstre" | "Centreret", "filled">;
	
	/**
	 * Kort field in *Features → Cards → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: features.cards.primary.cards[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	cards: prismic.GroupField<Simplify<FeaturesSliceCardsPrimaryCardsItem>>;
	
	/**
	 * Kort-farve field in *Features → Cards → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Neutral
	 * - **API ID Path**: features.cards.primary.card_color
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	card_color: prismic.SelectField<"Neutral" | "Primær" | "Sekundær" | "Uden farve", "filled">;
	
	/**
	 * Baggrundstema field in *Features → Cards → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Lys
	 * - **API ID Path**: features.cards.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Cards variation for Features Slice
 *
 * - **API ID**: `cards`
 * - **Description**: Cards
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FeaturesSliceCards = prismic.SharedSliceVariation<"cards", Simplify<FeaturesSliceCardsPrimary>, never>;

/**
 * Primary content in *Features → Split → Primary*
 */
export interface FeaturesSliceSplitPrimary {
	/**
	 * Overskrift field in *Features → Split → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Sektionens overskrift
	 * - **API ID Path**: features.split.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Brødtekst field in *Features → Split → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort intro under overskriften
	 * - **API ID Path**: features.split.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Billede field in *Features → Split → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Firkantet billede (1:1)
	 * - **API ID Path**: features.split.primary.image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
	
	/**
	 * Bokse field in *Features → Split → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: features.split.primary.features[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	features: prismic.GroupField<Simplify<FeaturesSliceSplitPrimaryFeaturesItem>>;
	
	/**
	 * Boks-farve field in *Features → Split → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Neutral
	 * - **API ID Path**: features.split.primary.feature_color
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	feature_color: prismic.SelectField<"Neutral" | "Primær" | "Sekundær" | "Uden farve", "filled">;
	
	/**
	 * Boks-layout field in *Features → Split → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Enkelt kolonne
	 * - **API ID Path**: features.split.primary.feature_layout
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	feature_layout: prismic.SelectField<"Enkelt kolonne" | "To kolonner", "filled">;
	
	/**
	 * Backdrop bag billede field in *Features → Split → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Ingen
	 * - **API ID Path**: features.split.primary.backdrop
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	backdrop: prismic.SelectField<"Ingen" | "Roteret", "filled">;
	
	/**
	 * Backdrop-farve field in *Features → Split → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Sekundær
	 * - **API ID Path**: features.split.primary.backdrop_color
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	backdrop_color: prismic.SelectField<"Sekundær" | "Primær" | "Neutral", "filled">;
	
	/**
	 * Billedets side (desktop) field in *Features → Split → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Venstre
	 * - **API ID Path**: features.split.primary.image_side
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	image_side: prismic.SelectField<"Venstre" | "Højre", "filled">;
	
	/**
	 * Rækkefølge på mobil field in *Features → Split → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Billede øverst
	 * - **API ID Path**: features.split.primary.mobile_order
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	mobile_order: prismic.SelectField<"Billede øverst" | "Tekst øverst", "filled">;
	
	/**
	 * Baggrundstema field in *Features → Split → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Lys
	 * - **API ID Path**: features.split.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Split variation for Features Slice
 *
 * - **API ID**: `split`
 * - **Description**: Split
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FeaturesSliceSplit = prismic.SharedSliceVariation<"split", Simplify<FeaturesSliceSplitPrimary>, never>;

/**
 * Primary content in *Features → Bento → Primary*
 */
export interface FeaturesSliceBentoPrimary {
	/**
	 * Overskrift field in *Features → Bento → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Sektionens overskrift
	 * - **API ID Path**: features.bento.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Brødtekst field in *Features → Bento → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort intro under overskriften
	 * - **API ID Path**: features.bento.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Overskrift-justering field in *Features → Bento → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Centreret
	 * - **API ID Path**: features.bento.primary.heading_align
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	heading_align: prismic.SelectField<"Venstre" | "Centreret", "filled">;
	
	/**
	 * Overskrift: knap (fx Se alle ydelser) field in *Features → Bento → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: features.bento.primary.cta_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	cta_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Stor kasse: billede field in *Features → Bento → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Højformat-billede (4:5)
	 * - **API ID Path**: features.bento.primary.card_1_image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	card_1_image: prismic.ImageField<never>;
	
	/**
	 * Stor kasse: titel field in *Features → Bento → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort titel
	 * - **API ID Path**: features.bento.primary.card_1_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	card_1_title: prismic.RichTextField;
	
	/**
	 * Stor kasse: tekst field in *Features → Bento → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort beskrivelse
	 * - **API ID Path**: features.bento.primary.card_1_body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	card_1_body: prismic.RichTextField;
	
	/**
	 * Stor kasse: knap field in *Features → Bento → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: features.bento.primary.card_1_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	card_1_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Bred kasse: titel field in *Features → Bento → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort titel
	 * - **API ID Path**: features.bento.primary.card_2_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	card_2_title: prismic.RichTextField;
	
	/**
	 * Bred kasse: tekst field in *Features → Bento → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort beskrivelse
	 * - **API ID Path**: features.bento.primary.card_2_body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	card_2_body: prismic.RichTextField;
	
	/**
	 * Bred kasse: knap field in *Features → Bento → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: features.bento.primary.card_2_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	card_2_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Bred kasse: billede field in *Features → Bento → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Firkantet billede (1:1)
	 * - **API ID Path**: features.bento.primary.card_2_image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	card_2_image: prismic.ImageField<never>;
	
	/**
	 * Kasse 3: titel field in *Features → Bento → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort titel
	 * - **API ID Path**: features.bento.primary.card_3_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	card_3_title: prismic.RichTextField;
	
	/**
	 * Kasse 3: tekst field in *Features → Bento → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort beskrivelse
	 * - **API ID Path**: features.bento.primary.card_3_body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	card_3_body: prismic.RichTextField;
	
	/**
	 * Kasse 3: knap field in *Features → Bento → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: features.bento.primary.card_3_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	card_3_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Kasse 4: titel field in *Features → Bento → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort titel
	 * - **API ID Path**: features.bento.primary.card_4_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	card_4_title: prismic.RichTextField;
	
	/**
	 * Kasse 4: tekst field in *Features → Bento → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort beskrivelse
	 * - **API ID Path**: features.bento.primary.card_4_body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	card_4_body: prismic.RichTextField;
	
	/**
	 * Kasse 4: knap field in *Features → Bento → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: features.bento.primary.card_4_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	card_4_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Baggrundstema field in *Features → Bento → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Lys
	 * - **API ID Path**: features.bento.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Bento variation for Features Slice
 *
 * - **API ID**: `bento`
 * - **Description**: Bento
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FeaturesSliceBento = prismic.SharedSliceVariation<"bento", Simplify<FeaturesSliceBentoPrimary>, never>;

/**
 * Primary content in *Features → Icon Bento → Primary*
 */
export interface FeaturesSliceIconBentoPrimary {
	/**
	 * Overskrift field in *Features → Icon Bento → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Sektionens overskrift
	 * - **API ID Path**: features.icon-bento.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Brødtekst field in *Features → Icon Bento → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort intro under overskriften
	 * - **API ID Path**: features.icon-bento.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Overskrift-justering field in *Features → Icon Bento → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Centreret
	 * - **API ID Path**: features.icon-bento.primary.heading_align
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	heading_align: prismic.SelectField<"Venstre" | "Centreret", "filled">;
	
	/**
	 * Kasse 1 (bred): ikon field in *Features → Icon Bento → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Iconify-navn, fx lucide:check
	 * - **API ID Path**: features.icon-bento.primary.box_1_icon
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	box_1_icon: prismic.KeyTextField;
	
	/**
	 * Kasse 1 (bred): titel field in *Features → Icon Bento → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort titel
	 * - **API ID Path**: features.icon-bento.primary.box_1_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	box_1_title: prismic.RichTextField;
	
	/**
	 * Kasse 1 (bred): tekst field in *Features → Icon Bento → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort beskrivelse
	 * - **API ID Path**: features.icon-bento.primary.box_1_body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	box_1_body: prismic.RichTextField;
	
	/**
	 * Kasse 2 (smal): ikon field in *Features → Icon Bento → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Iconify-navn, fx lucide:check
	 * - **API ID Path**: features.icon-bento.primary.box_2_icon
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	box_2_icon: prismic.KeyTextField;
	
	/**
	 * Kasse 2 (smal): titel field in *Features → Icon Bento → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort titel
	 * - **API ID Path**: features.icon-bento.primary.box_2_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	box_2_title: prismic.RichTextField;
	
	/**
	 * Kasse 2 (smal): tekst field in *Features → Icon Bento → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort beskrivelse
	 * - **API ID Path**: features.icon-bento.primary.box_2_body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	box_2_body: prismic.RichTextField;
	
	/**
	 * Kasse 3 (smal): ikon field in *Features → Icon Bento → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Iconify-navn, fx lucide:check
	 * - **API ID Path**: features.icon-bento.primary.box_3_icon
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	box_3_icon: prismic.KeyTextField;
	
	/**
	 * Kasse 3 (smal): titel field in *Features → Icon Bento → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort titel
	 * - **API ID Path**: features.icon-bento.primary.box_3_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	box_3_title: prismic.RichTextField;
	
	/**
	 * Kasse 3 (smal): tekst field in *Features → Icon Bento → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort beskrivelse
	 * - **API ID Path**: features.icon-bento.primary.box_3_body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	box_3_body: prismic.RichTextField;
	
	/**
	 * Kasse 4 (bred): ikon field in *Features → Icon Bento → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Iconify-navn, fx lucide:check
	 * - **API ID Path**: features.icon-bento.primary.box_4_icon
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	box_4_icon: prismic.KeyTextField;
	
	/**
	 * Kasse 4 (bred): titel field in *Features → Icon Bento → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort titel
	 * - **API ID Path**: features.icon-bento.primary.box_4_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	box_4_title: prismic.RichTextField;
	
	/**
	 * Kasse 4 (bred): tekst field in *Features → Icon Bento → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort beskrivelse
	 * - **API ID Path**: features.icon-bento.primary.box_4_body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	box_4_body: prismic.RichTextField;
	
	/**
	 * Baggrundstema field in *Features → Icon Bento → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Lys
	 * - **API ID Path**: features.icon-bento.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Icon Bento variation for Features Slice
 *
 * - **API ID**: `icon-bento`
 * - **Description**: Icon Bento
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FeaturesSliceIconBento = prismic.SharedSliceVariation<"icon-bento", Simplify<FeaturesSliceIconBentoPrimary>, never>;

/**
 * Slice variation for *Features*
 */
type FeaturesSliceVariation = FeaturesSliceDefault | FeaturesSliceCards | FeaturesSliceSplit | FeaturesSliceBento | FeaturesSliceIconBento

/**
 * Features Shared Slice
 *
 * - **API ID**: `features`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FeaturesSlice = prismic.SharedSlice<"features", FeaturesSliceVariation>;

/**
 * Primary content in *FooterColumnLinks → Default → Primary*
 */
export interface FooterColumnLinksSliceDefaultPrimary {
	/**
	 * Links field in *FooterColumnLinks → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: footer_column_links.default.primary.links
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	links: prismic.Repeatable<prismic.LinkField<string, string, unknown, prismic.FieldState, never>>;
	
	/**
	 * Overskrift field in *FooterColumnLinks → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: fx Produkter, Om os, Support
	 * - **API ID Path**: footer_column_links.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
}

/**
 * Default variation for FooterColumnLinks Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FooterColumnLinksSliceDefault = prismic.SharedSliceVariation<"default", Simplify<FooterColumnLinksSliceDefaultPrimary>, never>;

/**
 * Slice variation for *FooterColumnLinks*
 */
type FooterColumnLinksSliceVariation = FooterColumnLinksSliceDefault

/**
 * FooterColumnLinks Shared Slice
 *
 * - **API ID**: `footer_column_links`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FooterColumnLinksSlice = prismic.SharedSlice<"footer_column_links", FooterColumnLinksSliceVariation>;

/**
 * Primary content in *FooterColumnText → Default → Primary*
 */
export interface FooterColumnTextSliceDefaultPrimary {
	/**
	 * Indhold field in *FooterColumnText → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Adresse, CVR, åbningstider osv.
	 * - **API ID Path**: footer_column_text.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Overskrift field in *FooterColumnText → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: fx Kontakt, Åbningstider, Virksomhedsinfo
	 * - **API ID Path**: footer_column_text.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
}

/**
 * Default variation for FooterColumnText Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FooterColumnTextSliceDefault = prismic.SharedSliceVariation<"default", Simplify<FooterColumnTextSliceDefaultPrimary>, never>;

/**
 * Slice variation for *FooterColumnText*
 */
type FooterColumnTextSliceVariation = FooterColumnTextSliceDefault

/**
 * FooterColumnText Shared Slice
 *
 * - **API ID**: `footer_column_text`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FooterColumnTextSlice = prismic.SharedSlice<"footer_column_text", FooterColumnTextSliceVariation>;

/**
 * Item in *Gallery → Default → Primary → Galleri-billeder*
 */
export interface GallerySliceDefaultPrimaryItemsItem {
	/**
	 * Billede field in *Gallery → Default → Primary → Galleri-billeder*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: gallery.default.primary.items[].image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
	
	/**
	 * Beskrivelse (valgfri) field in *Gallery → Default → Primary → Galleri-billeder*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: gallery.default.primary.items[].caption
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	caption: prismic.RichTextField;
}

/**
 * Primary content in *Gallery → Default → Primary*
 */
export interface GallerySliceDefaultPrimary {
	/**
	 * Overskrift field in *Gallery → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: gallery.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Brødtekst field in *Gallery → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: gallery.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Overskrift-justering field in *Gallery → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Venstre
	 * - **API ID Path**: gallery.default.primary.heading_align
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	heading_align: prismic.SelectField<"Venstre" | "Centreret", "filled">;
	
	/**
	 * Feature-billede (16:9) field in *Gallery → Default → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: gallery.default.primary.feature_image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	feature_image: prismic.ImageField<never>;
	
	/**
	 * Feature-beskrivelse field in *Gallery → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: gallery.default.primary.feature_caption
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	feature_caption: prismic.RichTextField;
	
	/**
	 * Galleri-billeder field in *Gallery → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: gallery.default.primary.items[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	items: prismic.GroupField<Simplify<GallerySliceDefaultPrimaryItemsItem>>;
	
	/**
	 * Baggrundstema field in *Gallery → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Lys
	 * - **API ID Path**: gallery.default.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Default variation for Gallery Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type GallerySliceDefault = prismic.SharedSliceVariation<"default", Simplify<GallerySliceDefaultPrimary>, never>;

/**
 * Slice variation for *Gallery*
 */
type GallerySliceVariation = GallerySliceDefault

/**
 * Gallery Shared Slice
 *
 * - **API ID**: `gallery`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type GallerySlice = prismic.SharedSlice<"gallery", GallerySliceVariation>;

/**
 * Item in *HeaderClassic → Default → Primary → Menupunkter*
 */
export interface HeaderClassicSliceDefaultPrimaryNavGroupsItem {
	/**
	 * Links field in *HeaderClassic → Default → Primary → Menupunkter*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: header_classic.default.primary.nav_groups[].links
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	links: prismic.Repeatable<prismic.LinkField<string, string, unknown, prismic.FieldState, never>>;
}

/**
 * Primary content in *HeaderClassic → Default → Primary*
 */
export interface HeaderClassicSliceDefaultPrimary {
	/**
	 * Logo field in *HeaderClassic → Default → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Valgfri — 60px høj, fri bredde. Tom = sitenavn som tekst
	 * - **API ID Path**: header_classic.default.primary.logo
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	logo: prismic.ImageField<never>;
	
	/**
	 * Call-to-action field in *HeaderClassic → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: Valgfri — hvis tom vises ingen knap
	 * - **API ID Path**: header_classic.default.primary.cta_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	cta_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Menupunkter field in *HeaderClassic → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: header_classic.default.primary.nav_groups[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	nav_groups: prismic.GroupField<Simplify<HeaderClassicSliceDefaultPrimaryNavGroupsItem>>;
}

/**
 * Default variation for HeaderClassic Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HeaderClassicSliceDefault = prismic.SharedSliceVariation<"default", Simplify<HeaderClassicSliceDefaultPrimary>, never>;

/**
 * Slice variation for *HeaderClassic*
 */
type HeaderClassicSliceVariation = HeaderClassicSliceDefault

/**
 * HeaderClassic Shared Slice
 *
 * - **API ID**: `header_classic`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HeaderClassicSlice = prismic.SharedSlice<"header_classic", HeaderClassicSliceVariation>;

/**
 * Primary content in *Hero → Centered → Primary*
 */
export interface HeroSliceCenteredPrimary {
	/**
	 * Overskrift field in *Hero → Centered → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Sidens primære overskrift (h1)
	 * - **API ID Path**: hero.centered.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Beskrivelse field in *Hero → Centered → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort beskrivende tekst under overskriften
	 * - **API ID Path**: hero.centered.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Call-to-action field in *Hero → Centered → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.centered.primary.cta_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	cta_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Sekundær knap field in *Hero → Centered → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.centered.primary.cta_link_secondary
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	cta_link_secondary: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Baggrundstema field in *Hero → Centered → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Baggrundstema for sektionen
	 * - **Default Value**: Lys
	 * - **API ID Path**: hero.centered.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Centered variation for Hero Slice
 *
 * - **API ID**: `centered`
 * - **Description**: Centered
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HeroSliceCentered = prismic.SharedSliceVariation<"centered", Simplify<HeroSliceCenteredPrimary>, never>;

/**
 * Primary content in *Hero → Split → Primary*
 */
export interface HeroSliceSplitPrimary {
	/**
	 * Overskrift field in *Hero → Split → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Sidens primære overskrift (h1)
	 * - **API ID Path**: hero.split.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Beskrivelse field in *Hero → Split → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort tekst under overskriften
	 * - **API ID Path**: hero.split.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Call-to-action field in *Hero → Split → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.split.primary.cta_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	cta_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Sekundær knap field in *Hero → Split → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.split.primary.cta_link_secondary
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	cta_link_secondary: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Tag: ikon field in *Hero → Split → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Iconify-navn, fx ph:coffee
	 * - **API ID Path**: hero.split.primary.tag_icon
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	tag_icon: prismic.KeyTextField;
	
	/**
	 * Tag: tekst field in *Hero → Split → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort label, fx Ristet i Aarhus siden 2018
	 * - **API ID Path**: hero.split.primary.tag_text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	tag_text: prismic.RichTextField;
	
	/**
	 * Billede field in *Hero → Split → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.split.primary.image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
	
	/**
	 * Billede (mobil) field in *Hero → Split → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Valgfrit mobil-crop (4:3) — ellers bruges desktop-billedet
	 * - **API ID Path**: hero.split.primary.image_mobile
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image_mobile: prismic.ImageField<never>;
	
	/**
	 * Backdrop bag billede field in *Hero → Split → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Blød baggrundsfarve bag billedet
	 * - **Default Value**: Roteret
	 * - **API ID Path**: hero.split.primary.backdrop
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	backdrop: prismic.SelectField<"Ingen" | "Roteret", "filled">;
	
	/**
	 * Backdrop-farve field in *Hero → Split → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Sekundær
	 * - **API ID Path**: hero.split.primary.backdrop_color
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	backdrop_color: prismic.SelectField<"Sekundær" | "Primær" | "Neutral", "filled">;
	
	/**
	 * Baggrundstema field in *Hero → Split → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Baggrundstema for sektionen
	 * - **Default Value**: Lys
	 * - **API ID Path**: hero.split.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Split variation for Hero Slice
 *
 * - **API ID**: `split`
 * - **Description**: Split
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HeroSliceSplit = prismic.SharedSliceVariation<"split", Simplify<HeroSliceSplitPrimary>, never>;

/**
 * Primary content in *Hero → About → Primary*
 */
export interface HeroSliceAboutPrimary {
	/**
	 * Overskrift field in *Hero → About → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.about.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Brødtekst field in *Hero → About → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.about.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Call-to-action field in *Hero → About → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.about.primary.cta_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	cta_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Sekundær knap field in *Hero → About → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.about.primary.cta_link_secondary
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	cta_link_secondary: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Billede field in *Hero → About → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Firkantet billede (1:1)
	 * - **API ID Path**: hero.about.primary.image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
	
	/**
	 * Backdrop bag billede field in *Hero → About → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Roteret
	 * - **API ID Path**: hero.about.primary.backdrop
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	backdrop: prismic.SelectField<"Ingen" | "Roteret", "filled">;
	
	/**
	 * Backdrop-farve field in *Hero → About → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Sekundær
	 * - **API ID Path**: hero.about.primary.backdrop_color
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	backdrop_color: prismic.SelectField<"Sekundær" | "Primær" | "Neutral", "filled">;
	
	/**
	 * Billedets side (desktop) field in *Hero → About → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Venstre
	 * - **API ID Path**: hero.about.primary.image_side
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	image_side: prismic.SelectField<"Venstre" | "Højre", "filled">;
	
	/**
	 * Rækkefølge på mobil field in *Hero → About → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Billede øverst
	 * - **API ID Path**: hero.about.primary.mobile_order
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	mobile_order: prismic.SelectField<"Billede øverst" | "Tekst øverst", "filled">;
	
	/**
	 * Baggrundstema field in *Hero → About → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Lys
	 * - **API ID Path**: hero.about.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * About variation for Hero Slice
 *
 * - **API ID**: `about`
 * - **Description**: About
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HeroSliceAbout = prismic.SharedSliceVariation<"about", Simplify<HeroSliceAboutPrimary>, never>;

/**
 * Slice variation for *Hero*
 */
type HeroSliceVariation = HeroSliceCentered | HeroSliceSplit | HeroSliceAbout

/**
 * Hero Shared Slice
 *
 * - **API ID**: `hero`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HeroSlice = prismic.SharedSlice<"hero", HeroSliceVariation>;

/**
 * Item in *Highlights → Default → Primary → Punkter*
 */
export interface HighlightsSliceDefaultPrimaryPointsItem {
	/**
	 * Ikon field in *Highlights → Default → Primary → Punkter*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: highlights.default.primary.points[].icon
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	icon: prismic.KeyTextField;
	
	/**
	 * Titel field in *Highlights → Default → Primary → Punkter*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: highlights.default.primary.points[].title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Tekst field in *Highlights → Default → Primary → Punkter*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: highlights.default.primary.points[].body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
}

/**
 * Primary content in *Highlights → Default → Primary*
 */
export interface HighlightsSliceDefaultPrimary {
	/**
	 * Overskrift field in *Highlights → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: highlights.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Brødtekst field in *Highlights → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: highlights.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Punkter field in *Highlights → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: highlights.default.primary.points[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	points: prismic.GroupField<Simplify<HighlightsSliceDefaultPrimaryPointsItem>>;
	
	/**
	 * Boks-farve field in *Highlights → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Neutral
	 * - **API ID Path**: highlights.default.primary.box_color
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	box_color: prismic.SelectField<"Neutral" | "Primær" | "Sekundær" | "Uden farve", "filled">;
	
	/**
	 * Lodret justering field in *Highlights → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Hvordan tekst og boks flugter ved forskellig højde
	 * - **Default Value**: Centreret
	 * - **API ID Path**: highlights.default.primary.content_align
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	content_align: prismic.SelectField<"Centreret" | "Øverst", "filled">;
	
	/**
	 * Baggrundstema field in *Highlights → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Lys
	 * - **API ID Path**: highlights.default.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Default variation for Highlights Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HighlightsSliceDefault = prismic.SharedSliceVariation<"default", Simplify<HighlightsSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Highlights*
 */
type HighlightsSliceVariation = HighlightsSliceDefault

/**
 * Highlights Shared Slice
 *
 * - **API ID**: `highlights`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HighlightsSlice = prismic.SharedSlice<"highlights", HighlightsSliceVariation>;

/**
 * Item in *Maps → Default → Primary → Info-punkter*
 */
export interface MapsSliceDefaultPrimaryInfoItemsItem {
	/**
	 * Ikon field in *Maps → Default → Primary → Info-punkter*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Iconify-navn (fx car — tom = intet ikon)
	 * - **API ID Path**: maps.default.primary.info_items[].icon
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	icon: prismic.KeyTextField;
	
	/**
	 * Tekst field in *Maps → Default → Primary → Info-punkter*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: maps.default.primary.info_items[].text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	text: prismic.RichTextField;
}

/**
 * Primary content in *Maps → Default → Primary*
 */
export interface MapsSliceDefaultPrimary {
	/**
	 * Overskrift field in *Maps → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: maps.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Brødtekst field in *Maps → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: maps.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Overskrift-justering field in *Maps → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Venstre
	 * - **API ID Path**: maps.default.primary.heading_align
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	heading_align: prismic.SelectField<"Venstre" | "Centreret", "filled">;
	
	/**
	 * Kort-billede field in *Maps → Default → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: maps.default.primary.map_image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	map_image: prismic.ImageField<never>;
	
	/**
	 * Boks-overskrift (fx Klinikkens adresse) field in *Maps → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: maps.default.primary.box_heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	box_heading: prismic.RichTextField;
	
	/**
	 * Adresse field in *Maps → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: maps.default.primary.address
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	address: prismic.RichTextField;
	
	/**
	 * Info-punkter field in *Maps → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: maps.default.primary.info_items[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	info_items: prismic.GroupField<Simplify<MapsSliceDefaultPrimaryInfoItemsItem>>;
	
	/**
	 * Google Maps-knaptekst field in *Maps → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: fx Åbn Google Maps
	 * - **API ID Path**: maps.default.primary.google_maps_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	google_maps_label: prismic.KeyTextField;
	
	/**
	 * Apple Maps-knaptekst field in *Maps → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: fx Åbn Apple Maps
	 * - **API ID Path**: maps.default.primary.apple_maps_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	apple_maps_label: prismic.KeyTextField;
	
	/**
	 * Baggrundstema field in *Maps → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Lys
	 * - **API ID Path**: maps.default.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Default variation for Maps Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type MapsSliceDefault = prismic.SharedSliceVariation<"default", Simplify<MapsSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Maps*
 */
type MapsSliceVariation = MapsSliceDefault

/**
 * Maps Shared Slice
 *
 * - **API ID**: `maps`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type MapsSlice = prismic.SharedSlice<"maps", MapsSliceVariation>;

/**
 * Primary content in *PhoneMockup → Masked → Primary*
 */
export interface PhoneMockupSliceMaskedPrimary {
	/**
	 * Venstre telefon field in *PhoneMockup → Masked → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: phone_mockup.masked.primary.screenshot_left
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	screenshot_left: prismic.ImageField<never>;
	
	/**
	 * Midterste telefon field in *PhoneMockup → Masked → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: phone_mockup.masked.primary.screenshot_center
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	screenshot_center: prismic.ImageField<never>;
	
	/**
	 * Højre telefon field in *PhoneMockup → Masked → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: phone_mockup.masked.primary.screenshot_right
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	screenshot_right: prismic.ImageField<never>;
	
	/**
	 * Boks-baggrund field in *PhoneMockup → Masked → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Neutral
	 * - **API ID Path**: phone_mockup.masked.primary.box_background
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	box_background: prismic.SelectField<"Neutral" | "Lys" | "Mørk" | "Primær tint" | "Sekundær tint" | "Ingen", "filled">;
	
	/**
	 * Boks-fill field in *PhoneMockup → Masked → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Gradient
	 * - **API ID Path**: phone_mockup.masked.primary.box_fill
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	box_fill: prismic.SelectField<"Gradient" | "Solid", "filled">;
	
	/**
	 * Baggrundstema field in *PhoneMockup → Masked → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Lys
	 * - **API ID Path**: phone_mockup.masked.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Masked variation for PhoneMockup Slice
 *
 * - **API ID**: `masked`
 * - **Description**: Masked
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type PhoneMockupSliceMasked = prismic.SharedSliceVariation<"masked", Simplify<PhoneMockupSliceMaskedPrimary>, never>;

/**
 * Slice variation for *PhoneMockup*
 */
type PhoneMockupSliceVariation = PhoneMockupSliceMasked

/**
 * PhoneMockup Shared Slice
 *
 * - **API ID**: `phone_mockup`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type PhoneMockupSlice = prismic.SharedSlice<"phone_mockup", PhoneMockupSliceVariation>;

/**
 * Item in *Prices → Default → Primary → Pakker*
 */
export interface PricesSliceDefaultPrimaryPlansItem {
	/**
	 * Pakketitel field in *Prices → Default → Primary → Pakker*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: prices.default.primary.plans[].title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Pris field in *Prices → Default → Primary → Pakker*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: prices.default.primary.plans[].price
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	price: prismic.RichTextField;
	
	/**
	 * Undertekst (fx pr. samtale) field in *Prices → Default → Primary → Pakker*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: prices.default.primary.plans[].caption
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	caption: prismic.RichTextField;
	
	/**
	 * Beskrivelse field in *Prices → Default → Primary → Pakker*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: prices.default.primary.plans[].body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Inkluderet (punktliste) field in *Prices → Default → Primary → Pakker*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: prices.default.primary.plans[].included
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	included: prismic.RichTextField;
	
	/**
	 * Liste-ikon (tom = check) field in *Prices → Default → Primary → Pakker*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: fx star — tom = check
	 * - **API ID Path**: prices.default.primary.plans[].included_icon
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	included_icon: prismic.KeyTextField;
	
	/**
	 * Knap (valgfri) field in *Prices → Default → Primary → Pakker*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: prices.default.primary.plans[].cta_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	cta_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Primary content in *Prices → Default → Primary*
 */
export interface PricesSliceDefaultPrimary {
	/**
	 * Overskrift field in *Prices → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: prices.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Brødtekst field in *Prices → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: prices.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Overskrift-justering field in *Prices → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Centreret
	 * - **API ID Path**: prices.default.primary.heading_align
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	heading_align: prismic.SelectField<"Venstre" | "Centreret", "filled">;
	
	/**
	 * Kort-farve field in *Prices → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Neutral
	 * - **API ID Path**: prices.default.primary.card_color
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	card_color: prismic.SelectField<"Neutral" | "Primær" | "Sekundær" | "Uden farve", "filled">;
	
	/**
	 * Pakker field in *Prices → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: prices.default.primary.plans[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	plans: prismic.GroupField<Simplify<PricesSliceDefaultPrimaryPlansItem>>;
	
	/**
	 * Baggrundstema field in *Prices → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Lys
	 * - **API ID Path**: prices.default.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Default variation for Prices Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type PricesSliceDefault = prismic.SharedSliceVariation<"default", Simplify<PricesSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Prices*
 */
type PricesSliceVariation = PricesSliceDefault

/**
 * Prices Shared Slice
 *
 * - **API ID**: `prices`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type PricesSlice = prismic.SharedSlice<"prices", PricesSliceVariation>;

/**
 * Primary content in *Profile → Default → Primary*
 */
export interface ProfileSliceDefaultPrimary {
	/**
	 * Portræt field in *Profile → Default → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Kvadratisk billede (vises rundt)
	 * - **API ID Path**: profile.default.primary.portrait
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	portrait: prismic.ImageField<never>;
	
	/**
	 * Beskrivelse field in *Profile → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Personlig introtekst
	 * - **API ID Path**: profile.default.primary.description
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	description: prismic.RichTextField;
	
	/**
	 * Citat field in *Profile → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort fremhævet citat
	 * - **API ID Path**: profile.default.primary.quote
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	quote: prismic.RichTextField;
	
	/**
	 * Signatur (SVG/PNG) field in *Profile → Default → Primary*
	 *
	 * - **Field Type**: Link to Media
	 * - **Placeholder**: Upload underskrift som billede
	 * - **API ID Path**: profile.default.primary.signature
	 * - **Documentation**: https://prismic.io/docs/fields/link-to-media
	 */
	signature: prismic.LinkToMediaField<prismic.FieldState, never>;
	
	/**
	 * Navn (til signatur-alt) field in *Profile → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Bruges som alt-tekst på signaturen
	 * - **API ID Path**: profile.default.primary.signature_name
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	signature_name: prismic.KeyTextField;
	
	/**
	 * Rolle / titel field in *Profile → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: fx Grundlægger & rister
	 * - **API ID Path**: profile.default.primary.role
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	role: prismic.RichTextField;
	
	/**
	 * Baggrundstema field in *Profile → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Lys
	 * - **API ID Path**: profile.default.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Default variation for Profile Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ProfileSliceDefault = prismic.SharedSliceVariation<"default", Simplify<ProfileSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Profile*
 */
type ProfileSliceVariation = ProfileSliceDefault

/**
 * Profile Shared Slice
 *
 * - **API ID**: `profile`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ProfileSlice = prismic.SharedSlice<"profile", ProfileSliceVariation>;

/**
 * Item in *Testimonials → Default → Primary → Anmeldelser*
 */
export interface TestimonialsSliceDefaultPrimaryTestimonialsItem {
	/**
	 * Overskrift field in *Testimonials → Default → Primary → Anmeldelser*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: testimonials.default.primary.testimonials[].title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Anmeldelse field in *Testimonials → Default → Primary → Anmeldelser*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: testimonials.default.primary.testimonials[].body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Afsender field in *Testimonials → Default → Primary → Anmeldelser*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: testimonials.default.primary.testimonials[].attribution
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	attribution: prismic.RichTextField;
	
	/**
	 * Boks-farve field in *Testimonials → Default → Primary → Anmeldelser*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Neutral
	 * - **API ID Path**: testimonials.default.primary.testimonials[].box_color
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	box_color: prismic.SelectField<"Neutral" | "Primær" | "Sekundær" | "Uden farve", "filled">;
}

/**
 * Primary content in *Testimonials → Default → Primary*
 */
export interface TestimonialsSliceDefaultPrimary {
	/**
	 * Overskrift field in *Testimonials → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: testimonials.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Brødtekst field in *Testimonials → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: testimonials.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Overskrift-justering field in *Testimonials → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Centreret
	 * - **API ID Path**: testimonials.default.primary.heading_align
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	heading_align: prismic.SelectField<"Venstre" | "Centreret", "filled">;
	
	/**
	 * Anmeldelser field in *Testimonials → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: testimonials.default.primary.testimonials[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	testimonials: prismic.GroupField<Simplify<TestimonialsSliceDefaultPrimaryTestimonialsItem>>;
	
	/**
	 * Vis flere-tekst field in *Testimonials → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx Læs flere
	 * - **API ID Path**: testimonials.default.primary.more_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	more_label: prismic.KeyTextField;
	
	/**
	 * Baggrundstema field in *Testimonials → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Lys
	 * - **API ID Path**: testimonials.default.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Default variation for Testimonials Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TestimonialsSliceDefault = prismic.SharedSliceVariation<"default", Simplify<TestimonialsSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Testimonials*
 */
type TestimonialsSliceVariation = TestimonialsSliceDefault

/**
 * Testimonials Shared Slice
 *
 * - **API ID**: `testimonials`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TestimonialsSlice = prismic.SharedSlice<"testimonials", TestimonialsSliceVariation>;

/**
 * Primary content in *TextContent → Default → Primary*
 */
export interface TextContentSliceDefaultPrimary {
	/**
	 * Overskrift field in *TextContent → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: text_content.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Brødtekst field in *TextContent → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: text_content.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Overskrift-justering field in *TextContent → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Centreret
	 * - **API ID Path**: text_content.default.primary.heading_align
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	heading_align: prismic.SelectField<"Venstre" | "Centreret", "filled">;
	
	/**
	 * Venstre: underoverskrift field in *TextContent → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: text_content.default.primary.left_heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	left_heading: prismic.RichTextField;
	
	/**
	 * Venstre: tekst field in *TextContent → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: text_content.default.primary.left_body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	left_body: prismic.RichTextField;
	
	/**
	 * Boks: titel field in *TextContent → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: text_content.default.primary.box_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	box_title: prismic.RichTextField;
	
	/**
	 * Boks: tekst field in *TextContent → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: text_content.default.primary.box_body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	box_body: prismic.RichTextField;
	
	/**
	 * Boks-farve field in *TextContent → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Neutral
	 * - **API ID Path**: text_content.default.primary.box_color
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	box_color: prismic.SelectField<"Neutral" | "Primær" | "Sekundær" | "Uden farve", "filled">;
	
	/**
	 * Højre: underoverskrift field in *TextContent → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: text_content.default.primary.right_heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	right_heading: prismic.RichTextField;
	
	/**
	 * Højre: tekst field in *TextContent → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: text_content.default.primary.right_body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	right_body: prismic.RichTextField;
	
	/**
	 * Baggrundstema field in *TextContent → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Lys
	 * - **API ID Path**: text_content.default.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Default variation for TextContent Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TextContentSliceDefault = prismic.SharedSliceVariation<"default", Simplify<TextContentSliceDefaultPrimary>, never>;

/**
 * Slice variation for *TextContent*
 */
type TextContentSliceVariation = TextContentSliceDefault

/**
 * TextContent Shared Slice
 *
 * - **API ID**: `text_content`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TextContentSlice = prismic.SharedSlice<"text_content", TextContentSliceVariation>;

/**
 * Primary content in *TextWithImages → Default → Primary*
 */
export interface TextWithImagesSliceDefaultPrimary {
	/**
	 * Overskrift field in *TextWithImages → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort overskrift over teksten
	 * - **API ID Path**: text_with_images.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Brødtekst field in *TextWithImages → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Beskrivende tekst ved siden af billedet
	 * - **API ID Path**: text_with_images.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Billede field in *TextWithImages → Default → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Liggende billede (4:3)
	 * - **API ID Path**: text_with_images.default.primary.image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
	
	/**
	 * Billedvisning field in *TextWithImages → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Med ramme (paspartout) eller kant-til-kant
	 * - **Default Value**: Rammet
	 * - **API ID Path**: text_with_images.default.primary.image_display
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	image_display: prismic.SelectField<"Rammet" | "Kant-til-kant", "filled">;
	
	/**
	 * Billedets side (desktop) field in *TextWithImages → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Venstre
	 * - **API ID Path**: text_with_images.default.primary.image_side
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	image_side: prismic.SelectField<"Venstre" | "Højre", "filled">;
	
	/**
	 * Rækkefølge på mobil field in *TextWithImages → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Billede øverst
	 * - **API ID Path**: text_with_images.default.primary.mobile_order
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	mobile_order: prismic.SelectField<"Billede øverst" | "Tekst øverst", "filled">;
	
	/**
	 * Baggrundstema field in *TextWithImages → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Lys
	 * - **API ID Path**: text_with_images.default.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Default variation for TextWithImages Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TextWithImagesSliceDefault = prismic.SharedSliceVariation<"default", Simplify<TextWithImagesSliceDefaultPrimary>, never>;

/**
 * Slice variation for *TextWithImages*
 */
type TextWithImagesSliceVariation = TextWithImagesSliceDefault

/**
 * TextWithImages Shared Slice
 *
 * - **API ID**: `text_with_images`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TextWithImagesSlice = prismic.SharedSlice<"text_with_images", TextWithImagesSliceVariation>;

declare module "@prismicio/client" {
	interface CreateClient {
		(repositoryNameOrEndpoint: string, options?: prismic.ClientConfig): prismic.Client<AllDocumentTypes>;
	}
	
	interface CreateWriteClient {
		(repositoryNameOrEndpoint: string, options: prismic.WriteClientConfig): prismic.WriteClient<AllDocumentTypes>;
	}
	
	interface CreateMigration {
		(): prismic.Migration<AllDocumentTypes>;
	}
	
	namespace Content {
		export type {
			BusinessDocument,
			BusinessDocumentData,
			BusinessDocumentDataSocialProfilesItem,
			FooterDocument,
			FooterDocumentData,
			FooterDocumentDataColumnsSlice,
			NavigationDocument,
			NavigationDocumentData,
			NavigationDocumentDataSlicesSlice,
			PageDocument,
			PageDocumentData,
			PageDocumentDataSlicesSlice,
			SettingsDocument,
			SettingsDocumentData,
			SettingsDocumentDataRedirectsItem,
			AllDocumentTypes,
			CaseStudiesSlice,
			CaseStudiesSliceDefaultPrimaryCasesItem,
			CaseStudiesSliceDefaultPrimary,
			CaseStudiesSliceVariation,
			CaseStudiesSliceDefault,
			FaqSlice,
			FaqSliceDefaultPrimaryItemsItem,
			FaqSliceDefaultPrimary,
			FaqSliceVariation,
			FaqSliceDefault,
			FeaturesSlice,
			FeaturesSliceDefaultPrimary,
			FeaturesSliceCardsPrimaryCardsItem,
			FeaturesSliceCardsPrimary,
			FeaturesSliceSplitPrimaryFeaturesItem,
			FeaturesSliceSplitPrimary,
			FeaturesSliceBentoPrimary,
			FeaturesSliceIconBentoPrimary,
			FeaturesSliceVariation,
			FeaturesSliceDefault,
			FeaturesSliceCards,
			FeaturesSliceSplit,
			FeaturesSliceBento,
			FeaturesSliceIconBento,
			FooterColumnLinksSlice,
			FooterColumnLinksSliceDefaultPrimary,
			FooterColumnLinksSliceVariation,
			FooterColumnLinksSliceDefault,
			FooterColumnTextSlice,
			FooterColumnTextSliceDefaultPrimary,
			FooterColumnTextSliceVariation,
			FooterColumnTextSliceDefault,
			GallerySlice,
			GallerySliceDefaultPrimaryItemsItem,
			GallerySliceDefaultPrimary,
			GallerySliceVariation,
			GallerySliceDefault,
			HeaderClassicSlice,
			HeaderClassicSliceDefaultPrimaryNavGroupsItem,
			HeaderClassicSliceDefaultPrimary,
			HeaderClassicSliceVariation,
			HeaderClassicSliceDefault,
			HeroSlice,
			HeroSliceCenteredPrimary,
			HeroSliceSplitPrimary,
			HeroSliceAboutPrimary,
			HeroSliceVariation,
			HeroSliceCentered,
			HeroSliceSplit,
			HeroSliceAbout,
			HighlightsSlice,
			HighlightsSliceDefaultPrimaryPointsItem,
			HighlightsSliceDefaultPrimary,
			HighlightsSliceVariation,
			HighlightsSliceDefault,
			MapsSlice,
			MapsSliceDefaultPrimaryInfoItemsItem,
			MapsSliceDefaultPrimary,
			MapsSliceVariation,
			MapsSliceDefault,
			PhoneMockupSlice,
			PhoneMockupSliceMaskedPrimary,
			PhoneMockupSliceVariation,
			PhoneMockupSliceMasked,
			PricesSlice,
			PricesSliceDefaultPrimaryPlansItem,
			PricesSliceDefaultPrimary,
			PricesSliceVariation,
			PricesSliceDefault,
			ProfileSlice,
			ProfileSliceDefaultPrimary,
			ProfileSliceVariation,
			ProfileSliceDefault,
			TestimonialsSlice,
			TestimonialsSliceDefaultPrimaryTestimonialsItem,
			TestimonialsSliceDefaultPrimary,
			TestimonialsSliceVariation,
			TestimonialsSliceDefault,
			TextContentSlice,
			TextContentSliceDefaultPrimary,
			TextContentSliceVariation,
			TextContentSliceDefault,
			TextWithImagesSlice,
			TextWithImagesSliceDefaultPrimary,
			TextWithImagesSliceVariation,
			TextWithImagesSliceDefault
		}
	}
}