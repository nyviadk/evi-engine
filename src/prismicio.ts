import { createClient as baseCreateClient } from "@prismicio/client";
import { enableAutoPreviews, type CreateClientConfig } from "@prismicio/next/pages";
import prismicConfig from "../prismic.config.json";

/**
 * The project's Prismic repository name.
 */
export const repositoryName = prismicConfig.repositoryName;

/**
 * Creates a Prismic client for the project's repository. The client is used to
 * query content from the Prismic API.
 *
 * @param config - Configuration for the Prismic client.
 */
export const createClient = ({
  previewData,
  req,
  ...config
}: CreateClientConfig = {}): ReturnType<typeof baseCreateClient> => {
	const client = baseCreateClient(repositoryName, {
		routes: prismicConfig.routes,
		...config,
	});

	enableAutoPreviews({ client, previewData, req });

	return client;
};