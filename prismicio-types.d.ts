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
	 * - **Placeholder**: Valgfri — hvis tom vises sitenavn som tekst
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
	background_theme: prismic.SelectField<"Lys" | "Mørk" | "Primær" | "Sekundær" | "Lys blød" | "Mørk blød" | "Primær blød" | "Sekundær blød", "filled">;
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

type PageDocumentDataSlicesSlice = never

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
	 * Favicon (lys baggrund) field in *Indstillinger*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.favicon_light
	 * - **Tab**: Generelt
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	favicon_light: prismic.ImageField<never>;
	
	/**
	 * Favicon (mørk baggrund) field in *Indstillinger*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
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
	layout_width: prismic.SelectField<"Klassisk (1200px)" | "Standard (1280px)" | "Moderne (1440px)" | "Ekspansiv (1664px)" | "Cinematic (1920px)">;
	
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
	font_select: prismic.SelectField<"System standard" | "Montserrat" | "Rethink Sans" | "Comfortaa" | "Poppins" | "Abel" | "Roboto" | "Open Sans" | "Inter" | "Lato", "filled">;
	
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
	color_scheme: prismic.SelectField<"Lys" | "Mørk" | "Lys & mørk (auto)", "filled">;/**
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
 * Primary content in *HeaderClassic → Default → Primary*
 */
export interface HeaderClassicSliceDefaultPrimary {
	/**
	 * Logo field in *HeaderClassic → Default → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Valgfri — hvis tom vises sitenavn som tekst
	 * - **API ID Path**: header_classic.default.primary.logo
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	logo: prismic.ImageField<never>;
	
	/**
	 * Menupunkter field in *HeaderClassic → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: Tilføj links med tekst
	 * - **API ID Path**: header_classic.default.primary.nav_items
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	nav_items: prismic.Repeatable<prismic.LinkField<string, string, unknown, prismic.FieldState, never>>;
	
	/**
	 * Call-to-action field in *HeaderClassic → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: Valgfri — hvis tom vises ingen knap
	 * - **API ID Path**: header_classic.default.primary.cta_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	cta_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
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
			FooterColumnLinksSlice,
			FooterColumnLinksSliceDefaultPrimary,
			FooterColumnLinksSliceVariation,
			FooterColumnLinksSliceDefault,
			FooterColumnTextSlice,
			FooterColumnTextSliceDefaultPrimary,
			FooterColumnTextSliceVariation,
			FooterColumnTextSliceDefault,
			HeaderClassicSlice,
			HeaderClassicSliceDefaultPrimary,
			HeaderClassicSliceVariation,
			HeaderClassicSliceDefault
		}
	}
}