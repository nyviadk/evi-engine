// Slices (og custom types), hvis id starter med et præfiks herfra, sendes kun til
// repoet ud for præfikset og til dev-repoet fra prismic.config.json. Resten sendes til alle.
export const SLICE_PREFIXES: Record<string, string> = {
  planio_: "myplanio",
};
