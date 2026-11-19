import { Download, ExternalLink } from "lucide-react";

import { EviAutoGrid } from "@/src/components/layout/EviAutoGrid";
import { EviRow } from "@/src/components/layout/EviRow";
import { EviSection } from "@/src/components/layout/EviSection";
import { EviStack } from "@/src/components/layout/EviStack";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import { EviRichText } from "@/src/components/typography/EviRichText";
import { EviTitle } from "@/src/components/typography/EviTitle";
import { box_surface, evi_card_bleed_class } from "@/src/components/ui/EviBox";
import { EviButton } from "@/src/components/ui/EviButton";
import { EviCard } from "@/src/components/ui/EviCard";
import type { EviContext } from "@/src/lib/prismic/context";
import { text_as_rich_text } from "@/src/lib/prismic/fields";
import { evi_card_body_class } from "@/src/lib/utils/card-text";
import { cn } from "@/src/lib/utils/cn";
import {
  absolute_url,
  STYLEGUIDE_FILES,
  styleguide_file_path,
  type PartnerLogo,
  type PlanioBrand,
} from "@/src/components/planio/styleguide/brand";
import { PlanioCopyButton } from "@/src/components/planio/styleguide/PlanioCopyButton";
import {
  brand_colors,
  contrast_pairs,
  corner_radius,
  da,
  FONT_WEIGHTS,
  LAYOUT_SPECS,
  muted_colors,
  shadows,
  SPACING,
  TYPE_SCALE,
  type ColorSpec,
} from "@/src/components/planio/styleguide/tokens";

type Resolver = EviContext["link_resolver"];

const paragraph = (text: string) => text_as_rich_text(text, "paragraph");
const heading = (text: string) => text_as_rich_text(text, "heading3");

const TH = "border-b border-current/10 px-3 py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap uppercase";
const TD = "border-b border-current/10 px-3 py-2.5 align-top";
const MONO = "font-mono whitespace-nowrap";
// Forklaringer får en mindstebredde, så tabellen hellere scroller end bliver en smal søjle.
const NOTE = "min-w-60";

function SectionIntro({
  title,
  text,
  linkResolver,
}: {
  title: string;
  text: string;
  linkResolver: Resolver;
}) {
  return (
    <EviHeadingGroup
      title={text_as_rich_text(title, "heading2")}
      description={paragraph(text)}
      linkResolver={linkResolver}
    />
  );
}

function DownloadButton({ href, name, label }: { href: string; name: string; label: string }) {
  return (
    <EviButton asChild variant="neutral" appearance="outline" size="sm" className="gap-1.5">
      <a href={href} download={name}>
        <Download aria-hidden="true" className="size-3.5 shrink-0" />
        {label}
      </a>
    </EviButton>
  );
}

/** Tabeller kan være bredere end skærmen og scroller da i deres egen boks. */
function Table({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <EviRow>
      {/* relative: ellers er tabellens sr-only-tekster og kopiér-bobler placeret
          ud fra siden og klippes ikke af scroll-boksen, så hele siden bliver bred. */}
      {/* tabIndex + region: en boks, der scroller, skal kunne nås og scrolles med tastaturet. */}
      <div
        tabIndex={0}
        role="region"
        aria-label={caption}
        className={cn(
          box_surface(null, "outlined"),
          "relative overflow-x-auto p-0 focus-visible:outline-2 focus-visible:outline-offset-2 sm:p-0 md:p-0",
        )}
      >
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          {children}
        </table>
      </div>
    </EviRow>
  );
}

function ColorCard({ color, linkResolver }: { color: ColorSpec; linkResolver: Resolver }) {
  const rows = [
    { label: "HEX", value: color.hex },
    { label: "RGB", value: `rgb(${color.rgb})` },
  ];
  return (
    <EviCard rows={4} className={cn(box_surface(), "overflow-hidden")}>
      <div
        aria-hidden="true"
        className={cn(evi_card_bleed_class("top"), "h-32 border-b border-current/10 sm:h-40")}
        // Farven ER indholdet her, så den kan ikke være et tema-token.
        style={{ backgroundColor: color.hex }}
      />
      <EviTitle field={heading(color.name)} linkResolver={linkResolver} size="xl" className="mt-4" />
      <EviRichText
        field={paragraph(color.recipe ? `${color.usage} ${color.recipe}.` : color.usage)}
        linkResolver={linkResolver}
        className={cn("mt-2", evi_card_body_class())}
      />
      <EviStack as="dl" gap="md" className="mt-4">
        {rows.map((row) => (
          // En dl-gruppe må kun indeholde dt og dd, så knappen får sin egen dd.
          <EviStack key={row.label} direction="row" wrap align="center" justify="between" gap="sm">
            <dt className="basis-full text-xs uppercase opacity-70">{row.label}</dt>
            <dd className="min-w-0 font-mono text-sm break-all">{row.value}</dd>
            <dd>
              <PlanioCopyButton value={row.value} label="Kopiér" context={`${color.name} ${row.label}`} />
            </dd>
          </EviStack>
        ))}
      </EviStack>
    </EviCard>
  );
}

export type PlanioStyleguideProps = {
  ctx: EviContext;
  brand: PlanioBrand;
  partners: PartnerLogo[];
};

/** My Planios designguide på /styleguide: logoer, app-ikon, farver, typografi og mål. */
export function PlanioStyleguide({ ctx, brand, partners }: PlanioStyleguideProps): React.ReactElement {
  const linkResolver = ctx.link_resolver;
  const file = (name: (typeof STYLEGUIDE_FILES)[keyof typeof STYLEGUIDE_FILES]) => styleguide_file_path(name);
  const radius = corner_radius(brand.radius);
  const manifest_url = absolute_url(ctx, file(STYLEGUIDE_FILES.manifest));
  const google_fonts = `https://fonts.google.com/specimen/${encodeURIComponent(brand.font).replace(/%20/g, "+")}`;

  const logos = brand.logoUrl
    ? [
        {
          id: "light",
          label: "Logo til lys baggrund",
          text: "Mørk tekst. Til hvide og lyse flader, fx websitet, dokumenter og lyse slides.",
          theme: "theme-light",
          file: STYLEGUIDE_FILES.logoLight,
        },
        {
          id: "dark",
          label: "Logo til mørk baggrund",
          text: "Lys tekst. Til mørke flader, fx mørke slides, sociale medier og print på mørk bund.",
          theme: "theme-dark",
          file: STYLEGUIDE_FILES.logoDark,
        },
      ]
    : [];

  return (
    <>
      <EviSection hero compact>
        <EviHeadingGroup
          title={text_as_rich_text("Designguide", "heading2")}
          description={paragraph(
            "Vores logoer, app-ikon, farver, typografi og afstande. Alt kan kopieres eller downloades herfra og bruges på websitet, i dokumenter og i præsentationer.",
          )}
          linkResolver={linkResolver}
          isHero
        />
      </EviSection>

      {logos.length > 0 && (
        <EviSection compact>
          <SectionIntro
            title="Logo"
            text="Vælg version efter baggrunden: logoet med lys tekst hører til på mørk bund og det med mørk tekst på lys. Begge er SVG og kan skaleres frit uden at blive uskarpe."
            linkResolver={linkResolver}
          />
          <EviAutoGrid size="duo">
            {logos.map((logo) => (
              <EviCard key={logo.id} rows={3} className={box_surface()}>
                <EviStack
                  align="center"
                  justify="center"
                  className={cn(logo.theme, "min-h-44 rounded-evi border border-current/10 p-6")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- SVG fra vores egen rute, ingen optimering at hente */}
                  <img
                    src={file(logo.file)}
                    alt={`${brand.siteName} – ${logo.label.toLowerCase()}`}
                    width={389}
                    height={146}
                    className="h-auto max-h-30 w-full max-w-75 object-contain"
                  />
                </EviStack>
                <EviStack gap="sm" className="mt-4">
                  <EviTitle field={heading(logo.label)} linkResolver={linkResolver} size="xl" />
                  <EviRichText field={paragraph(logo.text)} linkResolver={linkResolver} className={evi_card_body_class()} />
                </EviStack>
                <EviStack direction="row" wrap gap="sm" className="mt-4">
                  <PlanioCopyButton fromUrl={file(logo.file)} label="Kopiér SVG-kode" context={logo.label} />
                  <DownloadButton href={file(logo.file)} name={logo.file} label="Download SVG" />
                </EviStack>
              </EviCard>
            ))}
          </EviAutoGrid>
        </EviSection>
      )}

      {brand.appIcon && (
        <EviSection compact>
          <SectionIntro
            title="App-ikon"
            text="Ikonet fra App Store og Google Play. Det er kvadratisk og uden afrundede hjørner, fordi butikkerne og telefonen selv runder dem. Brug det, når der skal vises et lille mærke, fx som profilbillede eller ved siden af et link til appen."
            linkResolver={linkResolver}
          />
          <EviRow>
            <EviStack direction="row" wrap align="center" gap="xl" className={box_surface()}>
              {/* eslint-disable-next-line @next/next/no-img-element -- vises i fast størrelse, filen er den samme som download */}
              <img
                src={file(STYLEGUIDE_FILES.appIcon)}
                alt={`${brand.siteName} app-ikon`}
                width={128}
                height={128}
                className="shadow-evi size-32 shrink-0 rounded-[22.4%] [corner-shape:round]"
              />
              <EviStack gap="md" className="min-w-0 flex-1 basis-64">
                <EviStack gap="sm">
                  <EviTitle field={heading("App-ikon · PNG")} linkResolver={linkResolver} size="xl" />
                  <EviRichText
                    field={paragraph(
                      `${brand.appIcon.size ? `${brand.appIcon.size} × ${brand.appIcon.size} px` : "Fuld størrelse"}. Skalér det ned efter behov, aldrig op.`,
                    )}
                    linkResolver={linkResolver}
                    className={evi_card_body_class()}
                  />
                </EviStack>
                <EviStack direction="row" wrap gap="sm">
                  <DownloadButton href={file(STYLEGUIDE_FILES.appIcon)} name={STYLEGUIDE_FILES.appIcon} label="Download PNG" />
                  <PlanioCopyButton
                    value={absolute_url(ctx, file(STYLEGUIDE_FILES.appIcon))}
                    label="Kopiér adresse"
                    context="til app-ikonet"
                  />
                </EviStack>
              </EviStack>
            </EviStack>
          </EviRow>
        </EviSection>
      )}

      {partners.length > 0 && (
        <EviSection compact>
          <SectionIntro
            title="Eksterne logoer"
            text="Partnere og samarbejder, som vi viser på websitet. Logoerne hentes direkte fra sitet, så de altid er de samme. SVG-filer downloades, som de er, og resten som PNG, så de kan bruges i Word og PowerPoint. Logoerne tilhører de enkelte organisationer og må ikke ændres."
            linkResolver={linkResolver}
          />
          <EviRow>
            <DownloadButton
              href={file(STYLEGUIDE_FILES.partnerZip)}
              name="my-planio-eksterne-logoer.zip"
              label="Download alle (zip)"
            />
          </EviRow>
          <EviAutoGrid size="sm">
            {partners.map((logo) => (
              <EviCard key={logo.id} rows={3} className={box_surface()}>
                <EviStack
                  align="center"
                  justify="center"
                  className="theme-light h-30 rounded-evi border border-current/10 p-4"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- Prismic-adressen er allerede skaleret ned */}
                  <img
                    src={logo.previewUrl}
                    alt={`${logo.name} logo`}
                    width={logo.width}
                    height={logo.height}
                    loading="lazy"
                    className="size-full object-contain"
                  />
                </EviStack>
                <EviTitle field={heading(logo.name)} linkResolver={linkResolver} size="lg" className="mt-4" />
                <EviStack direction="row" wrap gap="sm" className="mt-4">
                  <DownloadButton href={logo.downloadUrl} name={logo.downloadName} label={`Download ${logo.format}`} />
                </EviStack>
              </EviCard>
            ))}
          </EviAutoGrid>
        </EviSection>
      )}

      <EviSection compact>
        <SectionIntro title="Farver" text="Farverne, vi bygger alt på." linkResolver={linkResolver} />
        <EviAutoGrid size="trio">
          {brand_colors(brand.colors).map((color) => (
            <ColorCard key={color.id} color={color} linkResolver={linkResolver} />
          ))}
        </EviAutoGrid>

        <EviHeadingGroup
          title={heading("Nedtonede flader")}
          description={paragraph(
            "To flader, ikke flere. Begge er grundfarverne blandet i baggrunden, så paletten forbliver den samme. Hex-værdien er den færdige farve og kan skrives direkte ind i Word og PowerPoint.",
          )}
          linkResolver={linkResolver}
        />
        <EviAutoGrid size="duo">
          {muted_colors(brand.colors).map((color) => (
            <ColorCard key={color.id} color={color} linkResolver={linkResolver} />
          ))}
        </EviAutoGrid>

        <EviHeadingGroup
          title={heading("Hvad må kombineres")}
          description={paragraph(
            "Tallene er en rettesnor, ikke en regel. Lav kontrast er svær at læse i brødtekst og længere afsnit, men kan godt være det rigtige valg til korte, store elementer som knaptekst, overskrifter og tal.",
          )}
          linkResolver={linkResolver}
        />
        <Table caption="Farvekombinationer og deres kontrast">
          <thead>
            <tr>
              <th scope="col" className={TH}>Kombination</th>
              <th scope="col" className={TH}>Eksempel</th>
              <th scope="col" className={TH}>Kontrast</th>
              <th scope="col" className={TH}>Brug</th>
            </tr>
          </thead>
          <tbody>
            {contrast_pairs(brand.colors).map((pair) => (
              <tr key={pair.label}>
                <th scope="row" className={cn(TD, "font-normal")}>{pair.label}</th>
                <td className={TD}>
                  <span
                    className="inline-block rounded-sm px-2.5 py-1 whitespace-nowrap"
                    style={{ color: pair.foreground, backgroundColor: pair.background }}
                  >
                    Aa tekst
                  </span>
                </td>
                <td className={cn(TD, MONO)}>
                  {da(pair.ratio)}:1 {pair.pass ? "· AA" : "· undgå"}
                </td>
                <td className={cn(TD, NOTE)}>{pair.note}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </EviSection>

      <EviSection compact>
        <SectionIntro
          title="Spacing"
          text="Alle afstande er hele gange 8 px. Her er de regnet om med 16 px = 12 pt, så de kan skrives direkte ind i Word, PowerPoint eller Figma. Hold dig til trinnene i stedet for at vælge tal frit: det er det, der får tingene til at se ud, som om de hører sammen."
          linkResolver={linkResolver}
        />
        <Table caption="Afstandstrin i px, pt og cm">
          <thead>
            <tr>
              <th scope="col" className={TH}>Trin</th>
              <th scope="col" className={TH}>Størrelse</th>
              <th scope="col" className={TH}>px</th>
              <th scope="col" className={TH}>pt</th>
              <th scope="col" className={TH}>cm</th>
              <th scope="col" className={TH}>Bruges til</th>
              <th scope="col" className={TH}><span className="sr-only">Kopiér</span></th>
            </tr>
          </thead>
          <tbody>
            {SPACING.map((step) => (
              <tr key={step.name}>
                <th scope="row" className={cn(TD, "font-semibold")}>{step.name}</th>
                <td className={TD}>
                  <span aria-hidden="true" className="block h-2.5 rounded-sm bg-evi-primary" style={{ width: step.px }} />
                </td>
                <td className={cn(TD, MONO)}>{step.px} px</td>
                <td className={cn(TD, MONO)}>{da(step.pt)} pt</td>
                <td className={cn(TD, MONO)}>{da(step.cm)} cm</td>
                <td className={cn(TD, NOTE)}>{step.usage}</td>
                <td className={TD}>
                  <PlanioCopyButton value={da(step.cm)} label="Kopiér cm" context={`for trin ${step.name}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </EviSection>

      <EviSection compact>
        <SectionIntro
          title="Typografi"
          text={`${brand.font} til alt, både overskrifter og brødtekst. Skriften er ikke installeret i Office som standard, så hent den først. Er den ikke tilgængelig, så brug en neutral skrift som Verdana i stedet for en tilfældig erstatning.`}
          linkResolver={linkResolver}
        />
        <EviRow>
          <EviStack gap="md" className={box_surface()}>
            <EviTitle field={heading(brand.font)} linkResolver={linkResolver} size="2xl" />
            <EviRichText field={paragraph(FONT_WEIGHTS)} linkResolver={linkResolver} className={evi_card_body_class()} />
            <EviRichText
              field={paragraph("AaBbCcDdEeFfGgHhIiJjKkLlMmNn ÆØÅ 0123456789")}
              linkResolver={linkResolver}
              className="evi-lead [&_p]:m-0"
            />
            <EviStack direction="row" wrap gap="sm">
              <EviButton asChild variant="neutral" appearance="outline" size="sm" className="gap-1.5">
                <a href={google_fonts} target="_blank" rel="noreferrer">
                  Hent på Google Fonts
                  <ExternalLink aria-hidden="true" className="size-3.5 shrink-0" />
                  <span className="sr-only">(åbner i en ny fane)</span>
                </a>
              </EviButton>
            </EviStack>
          </EviStack>
        </EviRow>
        <Table caption="Skriftstørrelser på web, i dokumenter og på slides">
          <thead>
            <tr>
              <th scope="col" className={TH}>Rolle</th>
              <th scope="col" className={TH}>Web</th>
              <th scope="col" className={TH}>Dokument (A4)</th>
              <th scope="col" className={TH}>Slide (16:9)</th>
              <th scope="col" className={TH}>Linjeafstand</th>
              <th scope="col" className={TH}>Vægt</th>
            </tr>
          </thead>
          <tbody>
            {TYPE_SCALE.map((step) => (
              <tr key={step.role}>
                <th scope="row" className={cn(TD, "font-semibold whitespace-nowrap")}>{step.role}</th>
                <td className={cn(TD, MONO)}>
                  {step.webMinPx === step.webMaxPx ? step.webMinPx : `${step.webMinPx}–${step.webMaxPx}`} px
                </td>
                <td className={cn(TD, MONO)}>{da(step.docPt)} pt</td>
                <td className={cn(TD, MONO)}>{da(step.slidePt)} pt</td>
                <td className={cn(TD, "font-mono")}>{da(step.lineHeight)}</td>
                <td className={cn(TD, "whitespace-nowrap")}>{step.weight} {step.weightName}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </EviSection>

      <EviSection compact>
        <SectionIntro
          title="Dokumenter og præsentationer"
          text="Sådan oversættes systemet til Word og PowerPoint. Alle afstande kommer fra spacing-skalaen ovenfor."
          linkResolver={linkResolver}
        />
        <EviAutoGrid size="duo">
          {LAYOUT_SPECS.map((spec) => (
            <EviCard key={spec.id} rows={2} className={box_surface()}>
              <EviTitle field={heading(spec.title)} linkResolver={linkResolver} size="xl" />
              <SpecList entries={spec.entries.map((e) => ({ label: e.label, value: e.display }))} />
            </EviCard>
          ))}
        </EviAutoGrid>
        <EviRow>
          <EviStack gap="sm" className={box_surface()}>
            <EviTitle field={heading("Skygger og hjørner")} linkResolver={linkResolver} size="xl" />
            <EviRichText
              field={paragraph("Skyggerne kan skrives direkte ind i PowerPoints skygge-dialog, der bruger netop sløring, afstand og vinkel. På mørke flader er skyggen lys.")}
              linkResolver={linkResolver}
              className={evi_card_body_class()}
            />
            <SpecList
              entries={[
                { label: "Hjørneradius", value: radius.label },
                ...shadows(brand.colors.dark).map((s) => ({
                  label: `Skygge, ${s.name.toLowerCase()}`,
                  value: `${s.color.toUpperCase()} · ${s.opacityPercent} % · sløring ${s.blurPx} px · afstand ${s.distancePx} px · ${s.angleDegrees}°`,
                })),
              ]}
            />
          </EviStack>
        </EviRow>
      </EviSection>

      <EviSection compact>
        <SectionIntro
          title="Til værktøjer og AI-assistenter"
          text="Hele designguiden findes som JSON: farver, mål, SVG-koden til vores logoer og links til app-ikonet og de eksterne logoer. Så kan et værktøj eller en AI-assistent hente alt i ét kald uden at læse denne side. Adresserne er faste og ændrer sig ikke."
          linkResolver={linkResolver}
        />
        <EviRow>
          <EviStack gap="lg" className={box_surface()}>
            <AddressRow label="Manifest" url={manifest_url} open />
            <EviStack gap="md" className="border-t border-current/10 pt-6">
              {[STYLEGUIDE_FILES.logoLight, STYLEGUIDE_FILES.logoDark, ...(brand.appIcon ? [STYLEGUIDE_FILES.appIcon] : [])].map((name) => (
                <AddressRow key={name} label="Fil" url={absolute_url(ctx, file(name))} />
              ))}
            </EviStack>
          </EviStack>
        </EviRow>
      </EviSection>
    </>
  );
}

function SpecList({ entries }: { entries: { label: string; value: string }[] }) {
  return (
    <EviStack as="dl" gap="sm" className="mt-4 text-sm">
      {entries.map((entry) => (
        <EviStack
          key={entry.label}
          direction="row"
          wrap
          justify="between"
          gap="sm"
          className="border-b border-current/10 pb-2 last:border-0 last:pb-0"
        >
          <dt className="opacity-75">{entry.label}</dt>
          <dd className="font-mono">{entry.value}</dd>
        </EviStack>
      ))}
    </EviStack>
  );
}

function AddressRow({ label, url, open }: { label: string; url: string; open?: boolean }) {
  return (
    <EviStack direction="row" wrap align="center" justify="between" gap="sm">
      <div className="min-w-0">
        <span className="block text-xs uppercase opacity-70">{label}</span>
        <span className="block font-mono text-sm break-all">{url}</span>
      </div>
      <EviStack direction="row" wrap gap="sm">
        <PlanioCopyButton value={url} label="Kopiér" context={url} />
        {open && (
          <EviButton asChild variant="neutral" appearance="outline" size="sm" className="gap-1.5">
            <a href={url} target="_blank" rel="noreferrer">
              Åbn
              <ExternalLink aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="sr-only">(åbner i en ny fane)</span>
            </a>
          </EviButton>
        )}
      </EviStack>
    </EviStack>
  );
}
