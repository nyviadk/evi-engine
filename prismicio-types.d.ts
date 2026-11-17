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

type PageDocumentDataSlicesSlice = HeroSlice | FeaturesSlice | FaqSlice | HighlightsSlice | PhoneMockupSlice | TestimonialsSlice | TextWithImagesSlice | CaseStudiesSlice | PricesSlice | GallerySlice | MapsSlice | ProfileSlice | TextContentSlice | LogosSlice | PlanioHeroSlice | PlanioDaySlice | PlanioCustomizeSlice | PlanioRoadmapSlice

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
	 * Skrifttype field in *Indstillinger*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Vælg en skrifttype
	 * - **Default Value**: System standard
	 * - **API ID Path**: settings.font_select
	 * - **Tab**: Udseende og layout
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	font_select: prismic.SelectField<"System standard" | "Comfortaa" | "Plus Jakarta Sans", "filled">;
	
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
 * Item in *Features → Icon List → Primary → Punkter*
 */
export interface FeaturesSliceIconListPrimaryItemsItem {
	/**
	 * Ikon field in *Features → Icon List → Primary → Punkter*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Iconify-navn, fx lucide:brain
	 * - **API ID Path**: features.icon-list.primary.items[].icon
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	icon: prismic.KeyTextField;
	
	/**
	 * Tekst field in *Features → Icon List → Primary → Punkter*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort punkt, fx en fordel
	 * - **API ID Path**: features.icon-list.primary.items[].text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	text: prismic.RichTextField;
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
	 * - **Placeholder**: Stående billede (3:4)
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
 * Primary content in *Features → Icon List → Primary*
 */
export interface FeaturesSliceIconListPrimary {
	/**
	 * Overskrift field in *Features → Icon List → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Sektionens overskrift
	 * - **API ID Path**: features.icon-list.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Brødtekst field in *Features → Icon List → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort intro under overskriften
	 * - **API ID Path**: features.icon-list.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Overskrift-justering field in *Features → Icon List → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Centreret
	 * - **API ID Path**: features.icon-list.primary.heading_align
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	heading_align: prismic.SelectField<"Venstre" | "Centreret", "filled">;
	
	/**
	 * Punkter field in *Features → Icon List → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: features.icon-list.primary.items[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	items: prismic.GroupField<Simplify<FeaturesSliceIconListPrimaryItemsItem>>;
	
	/**
	 * Baggrundstema field in *Features → Icon List → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Lys
	 * - **API ID Path**: features.icon-list.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Icon List variation for Features Slice
 *
 * - **API ID**: `icon-list`
 * - **Description**: Icon List
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FeaturesSliceIconList = prismic.SharedSliceVariation<"icon-list", Simplify<FeaturesSliceIconListPrimary>, never>;

/**
 * Slice variation for *Features*
 */
type FeaturesSliceVariation = FeaturesSliceDefault | FeaturesSliceCards | FeaturesSliceSplit | FeaturesSliceBento | FeaturesSliceIconBento | FeaturesSliceIconList

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
	 * Overskrift field in *FooterColumnLinks → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: fx Produkter, Om os, Support
	 * - **API ID Path**: footer_column_links.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Links field in *FooterColumnLinks → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: footer_column_links.default.primary.links
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	links: prismic.Repeatable<prismic.LinkField<string, string, unknown, prismic.FieldState, never>>;
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
	 * Overskrift field in *FooterColumnText → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: fx Kontakt, Åbningstider, Virksomhedsinfo
	 * - **API ID Path**: footer_column_text.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Indhold field in *FooterColumnText → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Adresse, CVR, åbningstider osv.
	 * - **API ID Path**: footer_column_text.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
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
 * Primary content in *Hero → Cover → Primary*
 */
export interface HeroSliceCoverPrimary {
	/**
	 * Overskrift field in *Hero → Cover → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Sidens primære overskrift (h1)
	 * - **API ID Path**: hero.cover.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Beskrivelse field in *Hero → Cover → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort beskrivende tekst under overskriften
	 * - **API ID Path**: hero.cover.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Call-to-action field in *Hero → Cover → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.cover.primary.cta_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	cta_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Sekundær knap field in *Hero → Cover → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.cover.primary.cta_link_secondary
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	cta_link_secondary: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Billede field in *Hero → Cover → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Bredt full-bleed billede (2:1)
	 * - **API ID Path**: hero.cover.primary.image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
	
	/**
	 * Billede (mobil) field in *Hero → Cover → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Valgfrit mobil-crop (4:5) — ellers bruges desktop-billedet
	 * - **API ID Path**: hero.cover.primary.image_mobile
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image_mobile: prismic.ImageField<never>;
	
	/**
	 * Indholds-justering field in *Hero → Cover → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Venstre
	 * - **API ID Path**: hero.cover.primary.content_align
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	content_align: prismic.SelectField<"Venstre" | "Centreret" | "Højre", "filled">;
	
	/**
	 * Overlay-farve field in *Hero → Cover → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Mørk
	 * - **API ID Path**: hero.cover.primary.overlay_color
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	overlay_color: prismic.SelectField<"Mørk" | "Lys" | "Primær" | "Sekundær", "filled">;
}

/**
 * Cover variation for Hero Slice
 *
 * - **API ID**: `cover`
 * - **Description**: Cover
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HeroSliceCover = prismic.SharedSliceVariation<"cover", Simplify<HeroSliceCoverPrimary>, never>;

/**
 * Slice variation for *Hero*
 */
type HeroSliceVariation = HeroSliceCentered | HeroSliceSplit | HeroSliceAbout | HeroSliceCover

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
 * Item in *Logos → Default → Primary → Logoer*
 */
export interface LogosSliceDefaultPrimaryLogosItem {
	/**
	 * Logo field in *Logos → Default → Primary → Logoer*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: SVG eller PNG med gennemsigtig baggrund
	 * - **API ID Path**: logos.default.primary.logos[].logo
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	logo: prismic.ImageField<never>;
	
	/**
	 * Firmanavn field in *Logos → Default → Primary → Logoer*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Bruges som alt-tekst og vises hvis logo mangler
	 * - **API ID Path**: logos.default.primary.logos[].name
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	name: prismic.KeyTextField;
	
	/**
	 * Link (valgfrit) field in *Logos → Default → Primary → Logoer*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: logos.default.primary.logos[].link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Item in *Logos → Grouped → Primary → Gruppe 1: logoer*
 */
export interface LogosSliceGroupedPrimaryGroup1LogosItem {
	/**
	 * Logo field in *Logos → Grouped → Primary → Gruppe 1: logoer*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: SVG eller PNG med gennemsigtig baggrund
	 * - **API ID Path**: logos.grouped.primary.group_1_logos[].logo
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	logo: prismic.ImageField<never>;
	
	/**
	 * Firmanavn field in *Logos → Grouped → Primary → Gruppe 1: logoer*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Bruges som alt-tekst og vises hvis logo mangler
	 * - **API ID Path**: logos.grouped.primary.group_1_logos[].name
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	name: prismic.KeyTextField;
	
	/**
	 * Link (valgfrit) field in *Logos → Grouped → Primary → Gruppe 1: logoer*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: logos.grouped.primary.group_1_logos[].link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Item in *Logos → Grouped → Primary → Gruppe 2: logoer*
 */
export interface LogosSliceGroupedPrimaryGroup2LogosItem {
	/**
	 * Logo field in *Logos → Grouped → Primary → Gruppe 2: logoer*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: SVG eller PNG med gennemsigtig baggrund
	 * - **API ID Path**: logos.grouped.primary.group_2_logos[].logo
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	logo: prismic.ImageField<never>;
	
	/**
	 * Firmanavn field in *Logos → Grouped → Primary → Gruppe 2: logoer*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Bruges som alt-tekst og vises hvis logo mangler
	 * - **API ID Path**: logos.grouped.primary.group_2_logos[].name
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	name: prismic.KeyTextField;
	
	/**
	 * Link (valgfrit) field in *Logos → Grouped → Primary → Gruppe 2: logoer*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: logos.grouped.primary.group_2_logos[].link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Item in *Logos → Grouped → Primary → Gruppe 3: logoer*
 */
export interface LogosSliceGroupedPrimaryGroup3LogosItem {
	/**
	 * Logo field in *Logos → Grouped → Primary → Gruppe 3: logoer*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: SVG eller PNG med gennemsigtig baggrund
	 * - **API ID Path**: logos.grouped.primary.group_3_logos[].logo
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	logo: prismic.ImageField<never>;
	
	/**
	 * Firmanavn field in *Logos → Grouped → Primary → Gruppe 3: logoer*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Bruges som alt-tekst og vises hvis logo mangler
	 * - **API ID Path**: logos.grouped.primary.group_3_logos[].name
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	name: prismic.KeyTextField;
	
	/**
	 * Link (valgfrit) field in *Logos → Grouped → Primary → Gruppe 3: logoer*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: logos.grouped.primary.group_3_logos[].link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Primary content in *Logos → Default → Primary*
 */
export interface LogosSliceDefaultPrimary {
	/**
	 * Overskrift field in *Logos → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Valgfri — fx Kendt fra eller Vores partnere
	 * - **API ID Path**: logos.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Brødtekst field in *Logos → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Valgfri kort tekst under overskriften
	 * - **API ID Path**: logos.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Overskrift-justering field in *Logos → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Centreret
	 * - **API ID Path**: logos.default.primary.heading_align
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	heading_align: prismic.SelectField<"Venstre" | "Centreret", "filled">;
	
	/**
	 * Skjul overskrift og tekst field in *Logos → Default → Primary*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: logos.default.primary.hide_heading
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	hide_heading: prismic.BooleanField;
	
	/**
	 * Logoer field in *Logos → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: logos.default.primary.logos[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	logos: prismic.GroupField<Simplify<LogosSliceDefaultPrimaryLogosItem>>;
	
	/**
	 * Baggrundstema field in *Logos → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Baggrundstema for sektionen
	 * - **Default Value**: Lys
	 * - **API ID Path**: logos.default.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Default variation for Logos Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type LogosSliceDefault = prismic.SharedSliceVariation<"default", Simplify<LogosSliceDefaultPrimary>, never>;

/**
 * Primary content in *Logos → Grouped → Primary*
 */
export interface LogosSliceGroupedPrimary {
	/**
	 * Overskrift field in *Logos → Grouped → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Valgfri — fx Støttet og rådgivet af
	 * - **API ID Path**: logos.grouped.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Brødtekst field in *Logos → Grouped → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Valgfri kort tekst under overskriften
	 * - **API ID Path**: logos.grouped.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Overskrift-justering field in *Logos → Grouped → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Centreret
	 * - **API ID Path**: logos.grouped.primary.heading_align
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	heading_align: prismic.SelectField<"Venstre" | "Centreret", "filled">;
	
	/**
	 * Skjul overskrift og tekst field in *Logos → Grouped → Primary*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: logos.grouped.primary.hide_heading
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	hide_heading: prismic.BooleanField;
	
	/**
	 * Gruppe 1: titel field in *Logos → Grouped → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Leverandører eller Støttet af
	 * - **API ID Path**: logos.grouped.primary.group_1_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	group_1_title: prismic.RichTextField;
	
	/**
	 * Gruppe 1: logoer field in *Logos → Grouped → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: logos.grouped.primary.group_1_logos[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	group_1_logos: prismic.GroupField<Simplify<LogosSliceGroupedPrimaryGroup1LogosItem>>;
	
	/**
	 * Gruppe 2: titel field in *Logos → Grouped → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Leverandører eller Støttet af
	 * - **API ID Path**: logos.grouped.primary.group_2_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	group_2_title: prismic.RichTextField;
	
	/**
	 * Gruppe 2: logoer field in *Logos → Grouped → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: logos.grouped.primary.group_2_logos[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	group_2_logos: prismic.GroupField<Simplify<LogosSliceGroupedPrimaryGroup2LogosItem>>;
	
	/**
	 * Gruppe 3: titel field in *Logos → Grouped → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Leverandører eller Støttet af
	 * - **API ID Path**: logos.grouped.primary.group_3_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	group_3_title: prismic.RichTextField;
	
	/**
	 * Gruppe 3: logoer field in *Logos → Grouped → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: logos.grouped.primary.group_3_logos[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	group_3_logos: prismic.GroupField<Simplify<LogosSliceGroupedPrimaryGroup3LogosItem>>;
	
	/**
	 * Baggrundstema field in *Logos → Grouped → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Baggrundstema for sektionen
	 * - **Default Value**: Lys
	 * - **API ID Path**: logos.grouped.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Grouped variation for Logos Slice
 *
 * - **API ID**: `grouped`
 * - **Description**: Grouped
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type LogosSliceGrouped = prismic.SharedSliceVariation<"grouped", Simplify<LogosSliceGroupedPrimary>, never>;

/**
 * Slice variation for *Logos*
 */
type LogosSliceVariation = LogosSliceDefault | LogosSliceGrouped

/**
 * Logos Shared Slice
 *
 * - **API ID**: `logos`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type LogosSlice = prismic.SharedSlice<"logos", LogosSliceVariation>;

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
 * Item in *PlanioCustomize → Default → Primary → Onsdag: aftaler*
 */
export interface PlanioCustomizeSliceDefaultPrimaryPreviewItemsItem {
	/**
	 * Aftale field in *PlanioCustomize → Default → Primary → Onsdag: aftaler*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Holdmøde
	 * - **API ID Path**: planio_customize.default.primary.preview_items[].title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Farve field in *PlanioCustomize → Default → Primary → Onsdag: aftaler*
	 *
	 * - **Field Type**: Color
	 * - **Placeholder**: Tom = den valgte primærfarve
	 * - **API ID Path**: planio_customize.default.primary.preview_items[].color
	 * - **Documentation**: https://prismic.io/docs/fields/color
	 */
	color: prismic.ColorField;
}

/**
 * Item in *PlanioCustomize → Default → Primary → Temaer*
 */
export interface PlanioCustomizeSliceDefaultPrimaryPresetsItem {
	/**
	 * Navn field in *PlanioCustomize → Default → Primary → Temaer*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Læses op af skærmlæsere, fx Afslappet
	 * - **API ID Path**: planio_customize.default.primary.presets[].name
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	name: prismic.KeyTextField;
	
	/**
	 * Primær field in *PlanioCustomize → Default → Primary → Temaer*
	 *
	 * - **Field Type**: Color
	 * - **Placeholder**: *None*
	 * - **API ID Path**: planio_customize.default.primary.presets[].primary
	 * - **Documentation**: https://prismic.io/docs/fields/color
	 */
	primary: prismic.ColorField;
	
	/**
	 * Baggrund field in *PlanioCustomize → Default → Primary → Temaer*
	 *
	 * - **Field Type**: Color
	 * - **Placeholder**: *None*
	 * - **API ID Path**: planio_customize.default.primary.presets[].background
	 * - **Documentation**: https://prismic.io/docs/fields/color
	 */
	background: prismic.ColorField;
	
	/**
	 * Tekst field in *PlanioCustomize → Default → Primary → Temaer*
	 *
	 * - **Field Type**: Color
	 * - **Placeholder**: *None*
	 * - **API ID Path**: planio_customize.default.primary.presets[].text
	 * - **Documentation**: https://prismic.io/docs/fields/color
	 */
	text: prismic.ColorField;
}

/**
 * Item in *PlanioCustomize → Default → Primary → Dage: indstillinger*
 */
export interface PlanioCustomizeSliceDefaultPrimaryDaysSettingsItem {
	/**
	 * Indstilling field in *PlanioCustomize → Default → Primary → Dage: indstillinger*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Ugens første dag
	 * - **API ID Path**: planio_customize.default.primary.days_settings[].label
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	label: prismic.RichTextField;
	
	/**
	 * Værdi field in *PlanioCustomize → Default → Primary → Dage: indstillinger*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Mandag. Tom = kun kontakten
	 * - **API ID Path**: planio_customize.default.primary.days_settings[].value
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	value: prismic.RichTextField;
	
	/**
	 * Farvering field in *PlanioCustomize → Default → Primary → Dage: indstillinger*
	 *
	 * - **Field Type**: Color
	 * - **Placeholder**: Valgfri ring foran værdien, fx rød
	 * - **API ID Path**: planio_customize.default.primary.days_settings[].swatch
	 * - **Documentation**: https://prismic.io/docs/fields/color
	 */
	swatch: prismic.ColorField;
	
	/**
	 * Vis som kontakt field in *PlanioCustomize → Default → Primary → Dage: indstillinger*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: planio_customize.default.primary.days_settings[].toggle
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	toggle: prismic.BooleanField;
}

/**
 * Primary content in *PlanioCustomize → Default → Primary*
 */
export interface PlanioCustomizeSliceDefaultPrimary {
	/**
	 * Overskrift field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Gør appen til din
	 * - **API ID Path**: planio_customize.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Beskrivelse field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort tekst under overskriften
	 * - **API ID Path**: planio_customize.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Baggrundstema field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Mørk
	 * - **API ID Path**: planio_customize.default.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
	
	/**
	 * Farver: overskrift field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Helt dine egne farver
	 * - **API ID Path**: planio_customize.default.primary.colors_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	colors_title: prismic.RichTextField;
	
	/**
	 * Farver: tekst field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort tekst under overskriften
	 * - **API ID Path**: planio_customize.default.primary.colors_body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	colors_body: prismic.RichTextField;
	
	/**
	 * Farver: primær ved start field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Color
	 * - **Placeholder**: Farverne man ser først, gerne ikke et tema
	 * - **API ID Path**: planio_customize.default.primary.colors_primary
	 * - **Documentation**: https://prismic.io/docs/fields/color
	 */
	colors_primary: prismic.ColorField;
	
	/**
	 * Farver: baggrund ved start field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Color
	 * - **Placeholder**: *None*
	 * - **API ID Path**: planio_customize.default.primary.colors_background
	 * - **Documentation**: https://prismic.io/docs/fields/color
	 */
	colors_background: prismic.ColorField;
	
	/**
	 * Farver: tekst ved start field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Color
	 * - **Placeholder**: *None*
	 * - **API ID Path**: planio_customize.default.primary.colors_text
	 * - **Documentation**: https://prismic.io/docs/fields/color
	 */
	colors_text: prismic.ColorField;
	
	/**
	 * Onsdag: dag field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Onsdag
	 * - **API ID Path**: planio_customize.default.primary.preview_day
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	preview_day: prismic.RichTextField;
	
	/**
	 * Onsdag: energi field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx 40% tilbage
	 * - **API ID Path**: planio_customize.default.primary.preview_left
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	preview_left: prismic.RichTextField;
	
	/**
	 * Onsdag: energi i % field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Number
	 * - **Placeholder**: Fylder bjælken, fx 40
	 * - **API ID Path**: planio_customize.default.primary.preview_energy
	 * - **Documentation**: https://prismic.io/docs/fields/number
	 */
	preview_energy: prismic.NumberField;
	
	/**
	 * Onsdag: brugt energi i % field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Number
	 * - **Placeholder**: Grå felter efter de fyldte, fx 10
	 * - **API ID Path**: planio_customize.default.primary.preview_energy_used
	 * - **Documentation**: https://prismic.io/docs/fields/number
	 */
	preview_energy_used: prismic.NumberField;
	
	/**
	 * Onsdag: aftaler field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: planio_customize.default.primary.preview_items[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	preview_items: prismic.GroupField<Simplify<PlanioCustomizeSliceDefaultPrimaryPreviewItemsItem>>;
	
	/**
	 * Vælger: spørgsmål field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Til skærmlæsere, fx Hvilken farve vil du ændre?
	 * - **API ID Path**: planio_customize.default.primary.picker_legend
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	picker_legend: prismic.KeyTextField;
	
	/**
	 * Vælger: primær field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx Primære
	 * - **API ID Path**: planio_customize.default.primary.picker_primary
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	picker_primary: prismic.KeyTextField;
	
	/**
	 * Vælger: baggrund field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx Baggrund
	 * - **API ID Path**: planio_customize.default.primary.picker_background
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	picker_background: prismic.KeyTextField;
	
	/**
	 * Vælger: tekst field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx Tekst
	 * - **API ID Path**: planio_customize.default.primary.picker_text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	picker_text: prismic.KeyTextField;
	
	/**
	 * Vælger: farvefelt field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Til skærmlæsere, fx Mætning og lysstyrke
	 * - **API ID Path**: planio_customize.default.primary.picker_area
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	picker_area: prismic.KeyTextField;
	
	/**
	 * Vælger: farvetone field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Til skærmlæsere, fx Farvetone
	 * - **API ID Path**: planio_customize.default.primary.picker_hue
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	picker_hue: prismic.KeyTextField;
	
	/**
	 * Vælger: farvekode field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Til skærmlæsere, fx Farvekode
	 * - **API ID Path**: planio_customize.default.primary.picker_hex
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	picker_hex: prismic.KeyTextField;
	
	/**
	 * Vælger: lys/mørk-knap field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx Lys / mørk
	 * - **API ID Path**: planio_customize.default.primary.picker_swap
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	picker_swap: prismic.KeyTextField;
	
	/**
	 * Temaer: tekst field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Eller start fra et tema
	 * - **API ID Path**: planio_customize.default.primary.presets_label
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	presets_label: prismic.RichTextField;
	
	/**
	 * Temaer field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: planio_customize.default.primary.presets[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	presets: prismic.GroupField<Simplify<PlanioCustomizeSliceDefaultPrimaryPresetsItem>>;
	
	/**
	 * Energi: overskrift field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Energien, som du tænker den
	 * - **API ID Path**: planio_customize.default.primary.energy_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	energy_title: prismic.RichTextField;
	
	/**
	 * Energi: tekst field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort tekst under overskriften
	 * - **API ID Path**: planio_customize.default.primary.energy_body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	energy_body: prismic.RichTextField;
	
	/**
	 * Energi: fyldte felter field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Number
	 * - **Placeholder**: Ud af 5, fx 4
	 * - **API ID Path**: planio_customize.default.primary.energy_level
	 * - **Documentation**: https://prismic.io/docs/fields/number
	 */
	energy_level: prismic.NumberField;
	
	/**
	 * Energi: procent field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Procent
	 * - **API ID Path**: planio_customize.default.primary.unit_percent
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	unit_percent: prismic.RichTextField;
	
	/**
	 * Energi: procent-værdi field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx 40%
	 * - **API ID Path**: planio_customize.default.primary.unit_percent_value
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	unit_percent_value: prismic.KeyTextField;
	
	/**
	 * Energi: skeer field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Skeer
	 * - **API ID Path**: planio_customize.default.primary.unit_spoons
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	unit_spoons: prismic.RichTextField;
	
	/**
	 * Energi: skeer-værdi field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx 4
	 * - **API ID Path**: planio_customize.default.primary.unit_spoons_value
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	unit_spoons_value: prismic.KeyTextField;
	
	/**
	 * Energi: lyn field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Lyn
	 * - **API ID Path**: planio_customize.default.primary.unit_bolts
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	unit_bolts: prismic.RichTextField;
	
	/**
	 * Energi: lyn-værdi field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx 4
	 * - **API ID Path**: planio_customize.default.primary.unit_bolts_value
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	unit_bolts_value: prismic.KeyTextField;
	
	/**
	 * Energi: tal field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Tal
	 * - **API ID Path**: planio_customize.default.primary.unit_number
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	unit_number: prismic.RichTextField;
	
	/**
	 * Energi: tal-værdi field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx 4
	 * - **API ID Path**: planio_customize.default.primary.unit_number_value
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	unit_number_value: prismic.KeyTextField;
	
	/**
	 * Dage: skærmlæsertekst field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Beskriv kortet for dem, der ikke kan se det
	 * - **API ID Path**: planio_customize.default.primary.days_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	days_label: prismic.KeyTextField;
	
	/**
	 * Dage: indstillinger field in *PlanioCustomize → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: planio_customize.default.primary.days_settings[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	days_settings: prismic.GroupField<Simplify<PlanioCustomizeSliceDefaultPrimaryDaysSettingsItem>>;
}

/**
 * Default variation for PlanioCustomize Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type PlanioCustomizeSliceDefault = prismic.SharedSliceVariation<"default", Simplify<PlanioCustomizeSliceDefaultPrimary>, never>;

/**
 * Slice variation for *PlanioCustomize*
 */
type PlanioCustomizeSliceVariation = PlanioCustomizeSliceDefault

/**
 * PlanioCustomize Shared Slice
 *
 * - **API ID**: `planio_customize`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type PlanioCustomizeSlice = prismic.SharedSlice<"planio_customize", PlanioCustomizeSliceVariation>;

/**
 * Item in *PlanioDay → Default → Primary → Energi: svar*
 */
export interface PlanioDaySliceDefaultPrimaryCheckAnswersItem {
	/**
	 * Spørgsmål field in *PlanioDay → Default → Primary → Energi: svar*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Kroppen
	 * - **API ID Path**: planio_day.default.primary.check_answers[].question
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	question: prismic.RichTextField;
	
	/**
	 * Svar field in *PlanioDay → Default → Primary → Energi: svar*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Godt tilpas
	 * - **API ID Path**: planio_day.default.primary.check_answers[].answer
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	answer: prismic.RichTextField;
}

/**
 * Item in *PlanioDay → Default → Primary → Plan: begivenheder i dag*
 */
export interface PlanioDaySliceDefaultPrimaryPlanTodayItemsItem {
	/**
	 * Begivenhed field in *PlanioDay → Default → Primary → Plan: begivenheder i dag*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx Holdmøde
	 * - **API ID Path**: planio_day.default.primary.plan_today_items[].title
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * Tid field in *PlanioDay → Default → Primary → Plan: begivenheder i dag*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx 09.30–10.30
	 * - **API ID Path**: planio_day.default.primary.plan_today_items[].time
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	time: prismic.KeyTextField;
	
	/**
	 * Energi i % field in *PlanioDay → Default → Primary → Plan: begivenheder i dag*
	 *
	 * - **Field Type**: Number
	 * - **Placeholder**: Minus tager, plus giver, fx -20
	 * - **API ID Path**: planio_day.default.primary.plan_today_items[].energy
	 * - **Documentation**: https://prismic.io/docs/fields/number
	 */
	energy: prismic.NumberField;
	
	/**
	 * Valgt fra start field in *PlanioDay → Default → Primary → Plan: begivenheder i dag*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: true
	 * - **API ID Path**: planio_day.default.primary.plan_today_items[].checked
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	checked: prismic.BooleanField;
}

/**
 * Item in *PlanioDay → Default → Primary → Plan: begivenheder i morgen*
 */
export interface PlanioDaySliceDefaultPrimaryPlanTomorrowItemsItem {
	/**
	 * Begivenhed field in *PlanioDay → Default → Primary → Plan: begivenheder i morgen*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx Fødselsdag hos mor
	 * - **API ID Path**: planio_day.default.primary.plan_tomorrow_items[].title
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * Tid field in *PlanioDay → Default → Primary → Plan: begivenheder i morgen*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx 18.00–21.00
	 * - **API ID Path**: planio_day.default.primary.plan_tomorrow_items[].time
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	time: prismic.KeyTextField;
	
	/**
	 * Energi i % field in *PlanioDay → Default → Primary → Plan: begivenheder i morgen*
	 *
	 * - **Field Type**: Number
	 * - **Placeholder**: Minus tager, plus giver, fx -40
	 * - **API ID Path**: planio_day.default.primary.plan_tomorrow_items[].energy
	 * - **Documentation**: https://prismic.io/docs/fields/number
	 */
	energy: prismic.NumberField;
	
	/**
	 * Valgt fra start field in *PlanioDay → Default → Primary → Plan: begivenheder i morgen*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: true
	 * - **API ID Path**: planio_day.default.primary.plan_tomorrow_items[].checked
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	checked: prismic.BooleanField;
}

/**
 * Item in *PlanioDay → Default → Primary → Dialog: det hjælper*
 */
export interface PlanioDaySliceDefaultPrimaryDialogHelpsItem {
	/**
	 * Mærke field in *PlanioDay → Default → Primary → Dialog: det hjælper*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Én ting ad gangen
	 * - **API ID Path**: planio_day.default.primary.dialog_helps[].text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	text: prismic.RichTextField;
}

/**
 * Item in *PlanioDay → Default → Primary → Refleksion: tog på kræfterne*
 */
export interface PlanioDaySliceDefaultPrimaryReflectDrainsItem {
	/**
	 * Mærke field in *PlanioDay → Default → Primary → Refleksion: tog på kræfterne*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx For mange indtryk
	 * - **API ID Path**: planio_day.default.primary.reflect_drains[].text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	text: prismic.RichTextField;
	
	/**
	 * Valgt field in *PlanioDay → Default → Primary → Refleksion: tog på kræfterne*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: planio_day.default.primary.reflect_drains[].selected
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	selected: prismic.BooleanField;
}

/**
 * Item in *PlanioDay → Default → Primary → Refleksion: gjorde godt*
 */
export interface PlanioDaySliceDefaultPrimaryReflectGivesItem {
	/**
	 * Mærke field in *PlanioDay → Default → Primary → Refleksion: gjorde godt*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Rolig og tilpas
	 * - **API ID Path**: planio_day.default.primary.reflect_gives[].text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	text: prismic.RichTextField;
	
	/**
	 * Valgt field in *PlanioDay → Default → Primary → Refleksion: gjorde godt*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: planio_day.default.primary.reflect_gives[].selected
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	selected: prismic.BooleanField;
}

/**
 * Item in *PlanioDay → Default → Primary → Påmindelser: liste*
 */
export interface PlanioDaySliceDefaultPrimaryRemindItemsItem {
	/**
	 * Påmindelse field in *PlanioDay → Default → Primary → Påmindelser: liste*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Vitaminpiller
	 * - **API ID Path**: planio_day.default.primary.remind_items[].title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Hvornår field in *PlanioDay → Default → Primary → Påmindelser: liste*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Hver dag · 08.00
	 * - **API ID Path**: planio_day.default.primary.remind_items[].schedule
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	schedule: prismic.RichTextField;
	
	/**
	 * Fremhævet som nu field in *PlanioDay → Default → Primary → Påmindelser: liste*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: planio_day.default.primary.remind_items[].now
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	now: prismic.BooleanField;
}

/**
 * Primary content in *PlanioDay → Default → Primary*
 */
export interface PlanioDaySliceDefaultPrimary {
	/**
	 * Overskrift field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Sæt det vigtigste med fed, fx anden halvdel
	 * - **API ID Path**: planio_day.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Beskrivelse field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort tekst under overskriften
	 * - **API ID Path**: planio_day.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Energi: tidspunkt field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx 07.15
	 * - **API ID Path**: planio_day.default.primary.check_time
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	check_time: prismic.KeyTextField;
	
	/**
	 * Energi: overskrift field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Dagens energi
	 * - **API ID Path**: planio_day.default.primary.check_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	check_title: prismic.RichTextField;
	
	/**
	 * Energi: tekst field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Hvad sker der på dette tidspunkt
	 * - **API ID Path**: planio_day.default.primary.check_body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	check_body: prismic.RichTextField;
	
	/**
	 * Energi: skærmlæsertekst field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Beskriv kortet for dem, der ikke kan se det
	 * - **API ID Path**: planio_day.default.primary.check_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	check_label: prismic.KeyTextField;
	
	/**
	 * Energi: kortets titel field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx PlanioCheck
	 * - **API ID Path**: planio_day.default.primary.check_card_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	check_card_title: prismic.RichTextField;
	
	/**
	 * Energi: svar field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: planio_day.default.primary.check_answers[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	check_answers: prismic.GroupField<Simplify<PlanioDaySliceDefaultPrimaryCheckAnswersItem>>;
	
	/**
	 * Energi: forslag field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Foreslået 50%
	 * - **API ID Path**: planio_day.default.primary.check_result
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	check_result: prismic.RichTextField;
	
	/**
	 * Energi: forslag i % field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Number
	 * - **Placeholder**: Fylder bjælken, fx 50
	 * - **API ID Path**: planio_day.default.primary.check_energy
	 * - **Documentation**: https://prismic.io/docs/fields/number
	 */
	check_energy: prismic.NumberField;
	
	/**
	 * Energi: appens svar field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Koncentrationen er kort i dag.
	 * - **API ID Path**: planio_day.default.primary.check_says
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	check_says: prismic.RichTextField;
	
	/**
	 * Plan: tidspunkt field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx 07.30
	 * - **API ID Path**: planio_day.default.primary.plan_time
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	plan_time: prismic.KeyTextField;
	
	/**
	 * Plan: overskrift field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Planlæg dagen
	 * - **API ID Path**: planio_day.default.primary.plan_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	plan_title: prismic.RichTextField;
	
	/**
	 * Plan: tekst field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Opfordr til at prøve demoen
	 * - **API ID Path**: planio_day.default.primary.plan_body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	plan_body: prismic.RichTextField;
	
	/**
	 * Plan: dagens energi i % field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Number
	 * - **Placeholder**: Demoens startpunkt, fx 50
	 * - **API ID Path**: planio_day.default.primary.plan_start
	 * - **Documentation**: https://prismic.io/docs/fields/number
	 */
	plan_start: prismic.NumberField;
	
	/**
	 * Plan: tekst ved energi field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Dagens energi
	 * - **API ID Path**: planio_day.default.primary.plan_energy_label
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	plan_energy_label: prismic.RichTextField;
	
	/**
	 * Plan: tekst ved planlagt field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Planlagt
	 * - **API ID Path**: planio_day.default.primary.plan_planned_label
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	plan_planned_label: prismic.RichTextField;
	
	/**
	 * Plan: tekst ved tilbage field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Tilbage
	 * - **API ID Path**: planio_day.default.primary.plan_left_label
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	plan_left_label: prismic.RichTextField;
	
	/**
	 * Plan: status uden valg field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: {procent} bliver til tallet, fx Du starter på {procent}.
	 * - **API ID Path**: planio_day.default.primary.plan_status_start
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	plan_status_start: prismic.KeyTextField;
	
	/**
	 * Plan: status i balance field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx Din energi er i balance på {procent}.
	 * - **API ID Path**: planio_day.default.primary.plan_status_balance
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	plan_status_balance: prismic.KeyTextField;
	
	/**
	 * Plan: status over start field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx Du står på {procent}, mere end ventet.
	 * - **API ID Path**: planio_day.default.primary.plan_status_over
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	plan_status_over: prismic.KeyTextField;
	
	/**
	 * Plan: status når det går op field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx Din dag går præcis op.
	 * - **API ID Path**: planio_day.default.primary.plan_status_zero
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	plan_status_zero: prismic.KeyTextField;
	
	/**
	 * Plan: status ved underskud field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx Du mangler {procent} for at være i balance.
	 * - **API ID Path**: planio_day.default.primary.plan_status_short
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	plan_status_short: prismic.KeyTextField;
	
	/**
	 * Plan: i dag field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Dagen med fed, fx Onsdag i dag
	 * - **API ID Path**: planio_day.default.primary.plan_today_label
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	plan_today_label: prismic.RichTextField;
	
	/**
	 * Plan: begivenheder i dag field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: planio_day.default.primary.plan_today_items[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	plan_today_items: prismic.GroupField<Simplify<PlanioDaySliceDefaultPrimaryPlanTodayItemsItem>>;
	
	/**
	 * Plan: i morgen field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Dagen med fed, fx Torsdag tæller i morgen
	 * - **API ID Path**: planio_day.default.primary.plan_tomorrow_label
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	plan_tomorrow_label: prismic.RichTextField;
	
	/**
	 * Plan: begivenheder i morgen field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: planio_day.default.primary.plan_tomorrow_items[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	plan_tomorrow_items: prismic.GroupField<Simplify<PlanioDaySliceDefaultPrimaryPlanTomorrowItemsItem>>;
	
	/**
	 * Plan: mærke over noten field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Fremtidig funktion. Tomt = intet mærke
	 * - **API ID Path**: planio_day.default.primary.plan_note_badge
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	plan_note_badge: prismic.RichTextField;
	
	/**
	 * Plan: note ved lav energi field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Vises, når i morgen er valgt og energien er lav
	 * - **API ID Path**: planio_day.default.primary.plan_note
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	plan_note: prismic.RichTextField;
	
	/**
	 * Dialog: tidspunkt field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx 09.15
	 * - **API ID Path**: planio_day.default.primary.dialog_time
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	dialog_time: prismic.KeyTextField;
	
	/**
	 * Dialog: overskrift field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Før holdmødet
	 * - **API ID Path**: planio_day.default.primary.dialog_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	dialog_title: prismic.RichTextField;
	
	/**
	 * Dialog: tekst field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Hvad sker der på dette tidspunkt
	 * - **API ID Path**: planio_day.default.primary.dialog_body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	dialog_body: prismic.RichTextField;
	
	/**
	 * Dialog: skærmlæsertekst field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Beskriv kortet for dem, der ikke kan se det
	 * - **API ID Path**: planio_day.default.primary.dialog_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	dialog_label: prismic.KeyTextField;
	
	/**
	 * Dialog: mærke field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Fremtidig funktion. Tomt = intet mærke
	 * - **API ID Path**: planio_day.default.primary.dialog_badge
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	dialog_badge: prismic.RichTextField;
	
	/**
	 * Dialog: kortets titel field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Mit dialogkort
	 * - **API ID Path**: planio_day.default.primary.dialog_card_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	dialog_card_title: prismic.RichTextField;
	
	/**
	 * Dialog: tekst under titlen field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Delt med holdet
	 * - **API ID Path**: planio_day.default.primary.dialog_card_note
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	dialog_card_note: prismic.RichTextField;
	
	/**
	 * Dialog: kilde field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Fra PlanioCheck
	 * - **API ID Path**: planio_day.default.primary.dialog_source_label
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	dialog_source_label: prismic.RichTextField;
	
	/**
	 * Dialog: kildens tekst field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Koncentrationen er kort i dag.
	 * - **API ID Path**: planio_day.default.primary.dialog_source_text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	dialog_source_text: prismic.RichTextField;
	
	/**
	 * Dialog: tekst over mærker field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Det hjælper mig
	 * - **API ID Path**: planio_day.default.primary.dialog_helps_label
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	dialog_helps_label: prismic.RichTextField;
	
	/**
	 * Dialog: det hjælper field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: planio_day.default.primary.dialog_helps[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	dialog_helps: prismic.GroupField<Simplify<PlanioDaySliceDefaultPrimaryDialogHelpsItem>>;
	
	/**
	 * Refleksion: tidspunkt field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx 10.45
	 * - **API ID Path**: planio_day.default.primary.reflect_time
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	reflect_time: prismic.KeyTextField;
	
	/**
	 * Refleksion: overskrift field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Hvordan gik det?
	 * - **API ID Path**: planio_day.default.primary.reflect_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	reflect_title: prismic.RichTextField;
	
	/**
	 * Refleksion: tekst field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Hvad sker der på dette tidspunkt
	 * - **API ID Path**: planio_day.default.primary.reflect_body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	reflect_body: prismic.RichTextField;
	
	/**
	 * Refleksion: skærmlæsertekst field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Beskriv kortet for dem, der ikke kan se det
	 * - **API ID Path**: planio_day.default.primary.reflect_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	reflect_label: prismic.KeyTextField;
	
	/**
	 * Refleksion: lille label field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Holdmøde · planlagt -20%
	 * - **API ID Path**: planio_day.default.primary.reflect_card_label
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	reflect_card_label: prismic.RichTextField;
	
	/**
	 * Refleksion: spørgsmål field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Hvordan havde du det bagefter?
	 * - **API ID Path**: planio_day.default.primary.reflect_question
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	reflect_question: prismic.RichTextField;
	
	/**
	 * Refleksion: label for tog field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Tog på kræfterne
	 * - **API ID Path**: planio_day.default.primary.reflect_drains_label
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	reflect_drains_label: prismic.RichTextField;
	
	/**
	 * Refleksion: tog på kræfterne field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: planio_day.default.primary.reflect_drains[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	reflect_drains: prismic.GroupField<Simplify<PlanioDaySliceDefaultPrimaryReflectDrainsItem>>;
	
	/**
	 * Refleksion: label for gav field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Gjorde godt
	 * - **API ID Path**: planio_day.default.primary.reflect_gives_label
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	reflect_gives_label: prismic.RichTextField;
	
	/**
	 * Refleksion: gjorde godt field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: planio_day.default.primary.reflect_gives[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	reflect_gives: prismic.GroupField<Simplify<PlanioDaySliceDefaultPrimaryReflectGivesItem>>;
	
	/**
	 * Refleksion: appens forslag field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Forslag: tager mere energi
	 * - **API ID Path**: planio_day.default.primary.reflect_result
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	reflect_result: prismic.RichTextField;
	
	/**
	 * Refleksion: mærke over note field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Fremtidig funktion. Tomt = intet mærke
	 * - **API ID Path**: planio_day.default.primary.reflect_note_badge
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	reflect_note_badge: prismic.RichTextField;
	
	/**
	 * Refleksion: note field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Holdet tog over, da jeg mistede tråden.
	 * - **API ID Path**: planio_day.default.primary.reflect_note
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	reflect_note: prismic.RichTextField;
	
	/**
	 * Påmindelser: tidspunkt field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx 14.20
	 * - **API ID Path**: planio_day.default.primary.remind_time
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	remind_time: prismic.KeyTextField;
	
	/**
	 * Påmindelser: overskrift field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Check-in: Krop
	 * - **API ID Path**: planio_day.default.primary.remind_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	remind_title: prismic.RichTextField;
	
	/**
	 * Påmindelser: tekst field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Hvad sker der på dette tidspunkt
	 * - **API ID Path**: planio_day.default.primary.remind_body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	remind_body: prismic.RichTextField;
	
	/**
	 * Påmindelser: skærmlæsertekst field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Beskriv kortet for dem, der ikke kan se det
	 * - **API ID Path**: planio_day.default.primary.remind_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	remind_label: prismic.KeyTextField;
	
	/**
	 * Påmindelser: kortets titel field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Faste påmindelser
	 * - **API ID Path**: planio_day.default.primary.remind_card_title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	remind_card_title: prismic.RichTextField;
	
	/**
	 * Påmindelser: liste field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: planio_day.default.primary.remind_items[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	remind_items: prismic.GroupField<Simplify<PlanioDaySliceDefaultPrimaryRemindItemsItem>>;
	
	/**
	 * Påmindelser: mærke for nu field in *PlanioDay → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx nu
	 * - **API ID Path**: planio_day.default.primary.remind_now_label
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	remind_now_label: prismic.RichTextField;
}

/**
 * Default variation for PlanioDay Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type PlanioDaySliceDefault = prismic.SharedSliceVariation<"default", Simplify<PlanioDaySliceDefaultPrimary>, never>;

/**
 * Slice variation for *PlanioDay*
 */
type PlanioDaySliceVariation = PlanioDaySliceDefault

/**
 * PlanioDay Shared Slice
 *
 * - **API ID**: `planio_day`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type PlanioDaySlice = prismic.SharedSlice<"planio_day", PlanioDaySliceVariation>;

/**
 * Item in *PlanioHero → Default → Primary → Telefon: aftaler*
 */
export interface PlanioHeroSliceDefaultPrimaryPlanItemsItem {
	/**
	 * Tidspunkt field in *PlanioHero → Default → Primary → Telefon: aftaler*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx 09.30
	 * - **API ID Path**: planio_hero.default.primary.plan_items[].time
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	time: prismic.KeyTextField;
	
	/**
	 * Aftale field in *PlanioHero → Default → Primary → Telefon: aftaler*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Holdmøde
	 * - **API ID Path**: planio_hero.default.primary.plan_items[].title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Energi field in *PlanioHero → Default → Primary → Telefon: aftaler*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx -20% eller +10%
	 * - **API ID Path**: planio_hero.default.primary.plan_items[].change
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	change: prismic.KeyTextField;
	
	/**
	 * Udført field in *PlanioHero → Default → Primary → Telefon: aftaler*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: planio_hero.default.primary.plan_items[].done
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	done: prismic.BooleanField;
}

/**
 * Primary content in *PlanioHero → Default → Primary*
 */
export interface PlanioHeroSliceDefaultPrimary {
	/**
	 * Overskrift field in *PlanioHero → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Sidens primære overskrift (h1)
	 * - **API ID Path**: planio_hero.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Beskrivelse field in *PlanioHero → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort tekst under overskriften
	 * - **API ID Path**: planio_hero.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Call-to-action field in *PlanioHero → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: planio_hero.default.primary.cta_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	cta_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Sekundær knap field in *PlanioHero → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: planio_hero.default.primary.cta_link_secondary
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	cta_link_secondary: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Note under knapperne field in *PlanioHero → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Gratis · Ingen reklamer · Dansk og engelsk
	 * - **API ID Path**: planio_hero.default.primary.note
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	note: prismic.RichTextField;
	
	/**
	 * Telefon: beskrivelse field in *PlanioHero → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Læses op af skærmlæsere, fx Onsdagens plan i appen
	 * - **API ID Path**: planio_hero.default.primary.plan_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	plan_label: prismic.KeyTextField;
	
	/**
	 * Telefon: initialer field in *PlanioHero → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: To bogstaver i profilringen, fx OT
	 * - **API ID Path**: planio_hero.default.primary.plan_initials
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	plan_initials: prismic.KeyTextField;
	
	/**
	 * Telefon: dag field in *PlanioHero → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Onsdag
	 * - **API ID Path**: planio_hero.default.primary.plan_day
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	plan_day: prismic.RichTextField;
	
	/**
	 * Telefon: dato field in *PlanioHero → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx 14. oktober · Uge 42
	 * - **API ID Path**: planio_hero.default.primary.plan_date
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	plan_date: prismic.RichTextField;
	
	/**
	 * Telefon: energi field in *PlanioHero → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx 40% tilbage
	 * - **API ID Path**: planio_hero.default.primary.plan_energy
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	plan_energy: prismic.RichTextField;
	
	/**
	 * Telefon: fyldte energifelter field in *PlanioHero → Default → Primary*
	 *
	 * - **Field Type**: Number
	 * - **Placeholder**: Ud af 10, fx 4
	 * - **API ID Path**: planio_hero.default.primary.plan_energy_left
	 * - **Documentation**: https://prismic.io/docs/fields/number
	 */
	plan_energy_left: prismic.NumberField;
	
	/**
	 * Telefon: brugte energifelter field in *PlanioHero → Default → Primary*
	 *
	 * - **Field Type**: Number
	 * - **Placeholder**: Grå felter efter de fyldte, fx 1
	 * - **API ID Path**: planio_hero.default.primary.plan_energy_used
	 * - **Documentation**: https://prismic.io/docs/fields/number
	 */
	plan_energy_used: prismic.NumberField;
	
	/**
	 * Telefon: aftaler field in *PlanioHero → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: planio_hero.default.primary.plan_items[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	plan_items: prismic.GroupField<Simplify<PlanioHeroSliceDefaultPrimaryPlanItemsItem>>;
}

/**
 * Default variation for PlanioHero Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type PlanioHeroSliceDefault = prismic.SharedSliceVariation<"default", Simplify<PlanioHeroSliceDefaultPrimary>, never>;

/**
 * Slice variation for *PlanioHero*
 */
type PlanioHeroSliceVariation = PlanioHeroSliceDefault

/**
 * PlanioHero Shared Slice
 *
 * - **API ID**: `planio_hero`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type PlanioHeroSlice = prismic.SharedSlice<"planio_hero", PlanioHeroSliceVariation>;

/**
 * Item in *PlanioRoadmap → Default → Primary → Trin*
 */
export interface PlanioRoadmapSliceDefaultPrimaryStepsItem {
	/**
	 * Titel field in *PlanioRoadmap → Default → Primary → Trin*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Energi i flere lag
	 * - **API ID Path**: planio_roadmap.default.primary.steps[].title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Tekst field in *PlanioRoadmap → Default → Primary → Trin*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort beskrivelse af trinnet
	 * - **API ID Path**: planio_roadmap.default.primary.steps[].body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Mærkat field in *PlanioRoadmap → Default → Primary → Trin*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx I dag eller Senere
	 * - **API ID Path**: planio_roadmap.default.primary.steps[].tag
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	tag: prismic.RichTextField;
	
	/**
	 * Findes i appen i dag field in *PlanioRoadmap → Default → Primary → Trin*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: planio_roadmap.default.primary.steps[].current
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	current: prismic.BooleanField;
}

/**
 * Primary content in *PlanioRoadmap → Default → Primary*
 */
export interface PlanioRoadmapSliceDefaultPrimary {
	/**
	 * Overskrift field in *PlanioRoadmap → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Fx Det her er kun begyndelsen
	 * - **API ID Path**: planio_roadmap.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Beskrivelse field in *PlanioRoadmap → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort tekst under overskriften
	 * - **API ID Path**: planio_roadmap.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Trin field in *PlanioRoadmap → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: planio_roadmap.default.primary.steps[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	steps: prismic.GroupField<Simplify<PlanioRoadmapSliceDefaultPrimaryStepsItem>>;
	
	/**
	 * Baggrundstema field in *PlanioRoadmap → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Mørk
	 * - **API ID Path**: planio_roadmap.default.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Default variation for PlanioRoadmap Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type PlanioRoadmapSliceDefault = prismic.SharedSliceVariation<"default", Simplify<PlanioRoadmapSliceDefaultPrimary>, never>;

/**
 * Slice variation for *PlanioRoadmap*
 */
type PlanioRoadmapSliceVariation = PlanioRoadmapSliceDefault

/**
 * PlanioRoadmap Shared Slice
 *
 * - **API ID**: `planio_roadmap`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type PlanioRoadmapSlice = prismic.SharedSlice<"planio_roadmap", PlanioRoadmapSliceVariation>;

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
 * Item in *Testimonials → Carousel → Primary → Udtalelser*
 */
export interface TestimonialsSliceCarouselPrimaryTestimonialsItem {
	/**
	 * Kontekst (valgfri, fx forløb) field in *Testimonials → Carousel → Primary → Udtalelser*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: testimonials.carousel.primary.testimonials[].title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Citat field in *Testimonials → Carousel → Primary → Udtalelser*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: testimonials.carousel.primary.testimonials[].body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Afsender field in *Testimonials → Carousel → Primary → Udtalelser*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: testimonials.carousel.primary.testimonials[].attribution
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	attribution: prismic.RichTextField;
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
 * Primary content in *Testimonials → Carousel → Primary*
 */
export interface TestimonialsSliceCarouselPrimary {
	/**
	 * Overskrift field in *Testimonials → Carousel → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: testimonials.carousel.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Brødtekst field in *Testimonials → Carousel → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: testimonials.carousel.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Overskrift-justering field in *Testimonials → Carousel → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Centreret
	 * - **API ID Path**: testimonials.carousel.primary.heading_align
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	heading_align: prismic.SelectField<"Venstre" | "Centreret", "filled">;
	
	/**
	 * Ikon (fx citationstegn) field in *Testimonials → Carousel → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Iconify-navn, fx quote
	 * - **API ID Path**: testimonials.carousel.primary.quote_icon
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	quote_icon: prismic.KeyTextField;
	
	/**
	 * Udtalelser field in *Testimonials → Carousel → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: testimonials.carousel.primary.testimonials[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	testimonials: prismic.GroupField<Simplify<TestimonialsSliceCarouselPrimaryTestimonialsItem>>;
	
	/**
	 * Pil-ikon (valgfri) field in *Testimonials → Carousel → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Iconify-navn — tom = chevron
	 * - **API ID Path**: testimonials.carousel.primary.arrow_icon
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	arrow_icon: prismic.KeyTextField;
	
	/**
	 * Forrige-knap (skærmlæser) field in *Testimonials → Carousel → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx Forrige
	 * - **API ID Path**: testimonials.carousel.primary.prev_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	prev_label: prismic.KeyTextField;
	
	/**
	 * Næste-knap (skærmlæser) field in *Testimonials → Carousel → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Fx Næste
	 * - **API ID Path**: testimonials.carousel.primary.next_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	next_label: prismic.KeyTextField;
	
	/**
	 * Baggrundstema field in *Testimonials → Carousel → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Lys
	 * - **API ID Path**: testimonials.carousel.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Carousel variation for Testimonials Slice
 *
 * - **API ID**: `carousel`
 * - **Description**: Carousel
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TestimonialsSliceCarousel = prismic.SharedSliceVariation<"carousel", Simplify<TestimonialsSliceCarouselPrimary>, never>;

/**
 * Slice variation for *Testimonials*
 */
type TestimonialsSliceVariation = TestimonialsSliceDefault | TestimonialsSliceCarousel

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
 * Primary content in *TextWithImages → Collage → Primary*
 */
export interface TextWithImagesSliceCollagePrimary {
	/**
	 * Overskrift field in *TextWithImages → Collage → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort overskrift over teksten
	 * - **API ID Path**: text_with_images.collage.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Brødtekst field in *TextWithImages → Collage → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Beskrivende tekst ved siden af billederne
	 * - **API ID Path**: text_with_images.collage.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Knap field in *TextWithImages → Collage → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: text_with_images.collage.primary.cta_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	cta_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Billede 1 field in *TextWithImages → Collage → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Stående billede (3:4)
	 * - **API ID Path**: text_with_images.collage.primary.image_1
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image_1: prismic.ImageField<never>;
	
	/**
	 * Billede 2 field in *TextWithImages → Collage → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Kvadratisk billede (1:1)
	 * - **API ID Path**: text_with_images.collage.primary.image_2
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image_2: prismic.ImageField<never>;
	
	/**
	 * Billede 3 field in *TextWithImages → Collage → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Kvadratisk billede (1:1)
	 * - **API ID Path**: text_with_images.collage.primary.image_3
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image_3: prismic.ImageField<never>;
	
	/**
	 * Billede 4 field in *TextWithImages → Collage → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Stående billede (3:4)
	 * - **API ID Path**: text_with_images.collage.primary.image_4
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image_4: prismic.ImageField<never>;
	
	/**
	 * Billedernes side (desktop) field in *TextWithImages → Collage → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Venstre
	 * - **API ID Path**: text_with_images.collage.primary.image_side
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	image_side: prismic.SelectField<"Venstre" | "Højre", "filled">;
	
	/**
	 * Rækkefølge på mobil field in *TextWithImages → Collage → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Billede øverst
	 * - **API ID Path**: text_with_images.collage.primary.mobile_order
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	mobile_order: prismic.SelectField<"Billede øverst" | "Tekst øverst", "filled">;
	
	/**
	 * Baggrundstema field in *TextWithImages → Collage → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Lys
	 * - **API ID Path**: text_with_images.collage.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * Collage variation for TextWithImages Slice
 *
 * - **API ID**: `collage`
 * - **Description**: Collage
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TextWithImagesSliceCollage = prismic.SharedSliceVariation<"collage", Simplify<TextWithImagesSliceCollagePrimary>, never>;

/**
 * Primary content in *TextWithImages → To billeder → Primary*
 */
export interface TextWithImagesSliceDuoPrimary {
	/**
	 * Overskrift field in *TextWithImages → To billeder → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Kort overskrift over teksten
	 * - **API ID Path**: text_with_images.duo.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Brødtekst field in *TextWithImages → To billeder → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Beskrivende tekst ved siden af billederne
	 * - **API ID Path**: text_with_images.duo.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Knap field in *TextWithImages → To billeder → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: text_with_images.duo.primary.cta_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	cta_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Billede 1 field in *TextWithImages → To billeder → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Stående billede (3:4)
	 * - **API ID Path**: text_with_images.duo.primary.image_1
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image_1: prismic.ImageField<never>;
	
	/**
	 * Billede 2 field in *TextWithImages → To billeder → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Kvadratisk billede (1:1)
	 * - **API ID Path**: text_with_images.duo.primary.image_2
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image_2: prismic.ImageField<never>;
	
	/**
	 * Billedernes side (desktop) field in *TextWithImages → To billeder → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Højre
	 * - **API ID Path**: text_with_images.duo.primary.image_side
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	image_side: prismic.SelectField<"Venstre" | "Højre", "filled">;
	
	/**
	 * Rækkefølge på mobil field in *TextWithImages → To billeder → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Billede øverst
	 * - **API ID Path**: text_with_images.duo.primary.mobile_order
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	mobile_order: prismic.SelectField<"Billede øverst" | "Tekst øverst", "filled">;
	
	/**
	 * Baggrundstema field in *TextWithImages → To billeder → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: Lys
	 * - **API ID Path**: text_with_images.duo.primary.background_theme
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
}

/**
 * To billeder variation for TextWithImages Slice
 *
 * - **API ID**: `duo`
 * - **Description**: To billeder
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TextWithImagesSliceDuo = prismic.SharedSliceVariation<"duo", Simplify<TextWithImagesSliceDuoPrimary>, never>;

/**
 * Slice variation for *TextWithImages*
 */
type TextWithImagesSliceVariation = TextWithImagesSliceDefault | TextWithImagesSliceCollage | TextWithImagesSliceDuo

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
			FeaturesSliceIconListPrimaryItemsItem,
			FeaturesSliceIconListPrimary,
			FeaturesSliceVariation,
			FeaturesSliceDefault,
			FeaturesSliceCards,
			FeaturesSliceSplit,
			FeaturesSliceBento,
			FeaturesSliceIconBento,
			FeaturesSliceIconList,
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
			HeroSliceCoverPrimary,
			HeroSliceVariation,
			HeroSliceCentered,
			HeroSliceSplit,
			HeroSliceAbout,
			HeroSliceCover,
			HighlightsSlice,
			HighlightsSliceDefaultPrimaryPointsItem,
			HighlightsSliceDefaultPrimary,
			HighlightsSliceVariation,
			HighlightsSliceDefault,
			LogosSlice,
			LogosSliceDefaultPrimaryLogosItem,
			LogosSliceDefaultPrimary,
			LogosSliceGroupedPrimaryGroup1LogosItem,
			LogosSliceGroupedPrimaryGroup2LogosItem,
			LogosSliceGroupedPrimaryGroup3LogosItem,
			LogosSliceGroupedPrimary,
			LogosSliceVariation,
			LogosSliceDefault,
			LogosSliceGrouped,
			MapsSlice,
			MapsSliceDefaultPrimaryInfoItemsItem,
			MapsSliceDefaultPrimary,
			MapsSliceVariation,
			MapsSliceDefault,
			PhoneMockupSlice,
			PhoneMockupSliceMaskedPrimary,
			PhoneMockupSliceVariation,
			PhoneMockupSliceMasked,
			PlanioCustomizeSlice,
			PlanioCustomizeSliceDefaultPrimaryPreviewItemsItem,
			PlanioCustomizeSliceDefaultPrimaryPresetsItem,
			PlanioCustomizeSliceDefaultPrimaryDaysSettingsItem,
			PlanioCustomizeSliceDefaultPrimary,
			PlanioCustomizeSliceVariation,
			PlanioCustomizeSliceDefault,
			PlanioDaySlice,
			PlanioDaySliceDefaultPrimaryCheckAnswersItem,
			PlanioDaySliceDefaultPrimaryPlanTodayItemsItem,
			PlanioDaySliceDefaultPrimaryPlanTomorrowItemsItem,
			PlanioDaySliceDefaultPrimaryDialogHelpsItem,
			PlanioDaySliceDefaultPrimaryReflectDrainsItem,
			PlanioDaySliceDefaultPrimaryReflectGivesItem,
			PlanioDaySliceDefaultPrimaryRemindItemsItem,
			PlanioDaySliceDefaultPrimary,
			PlanioDaySliceVariation,
			PlanioDaySliceDefault,
			PlanioHeroSlice,
			PlanioHeroSliceDefaultPrimaryPlanItemsItem,
			PlanioHeroSliceDefaultPrimary,
			PlanioHeroSliceVariation,
			PlanioHeroSliceDefault,
			PlanioRoadmapSlice,
			PlanioRoadmapSliceDefaultPrimaryStepsItem,
			PlanioRoadmapSliceDefaultPrimary,
			PlanioRoadmapSliceVariation,
			PlanioRoadmapSliceDefault,
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
			TestimonialsSliceCarouselPrimaryTestimonialsItem,
			TestimonialsSliceCarouselPrimary,
			TestimonialsSliceVariation,
			TestimonialsSliceDefault,
			TestimonialsSliceCarousel,
			TextContentSlice,
			TextContentSliceDefaultPrimary,
			TextContentSliceVariation,
			TextContentSliceDefault,
			TextWithImagesSlice,
			TextWithImagesSliceDefaultPrimary,
			TextWithImagesSliceCollagePrimary,
			TextWithImagesSliceDuoPrimary,
			TextWithImagesSliceVariation,
			TextWithImagesSliceDefault,
			TextWithImagesSliceCollage,
			TextWithImagesSliceDuo
		}
	}
}