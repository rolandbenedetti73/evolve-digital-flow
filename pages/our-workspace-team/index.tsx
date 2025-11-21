import {
  Article,
  PCCConvenienceFunctions,
  Site,
} from "@pantheon-systems/pcc-react-sdk";
import { NextSeo } from "next-seo";
import queryString from "query-string";
import ArticleList from "../../components/article-list";
import Layout from "../../components/layout";
import { PAGE_SIZE } from "../../constants";

async function fetchNextPages(cursor?: string | null | undefined) {
  const url = queryString.stringifyUrl({
    url: "/api/utils/paginate",
    query: {
      pageSize: PAGE_SIZE,
      cursor: cursor,
    },
  });

  const response = await fetch(url);
  const { data, cursor: newCursor } = await response.json();
  return {
    data,
    newCursor,
  };
}

interface Props {
  articles: Article[];
  totalCount: number;
  cursor: string;
  site: Site;
}

export default function ArticlesListTemplate({
  articles,
  totalCount,
  cursor,
  site,
}: Props) {
  return (
    <Layout>
      <NextSeo
        title="Our Workspace Team"
        description="Members of our workspace team"
      />

      <ArticleList
        headerText="Our Workspace Team"
        articles={articles}
        cursor={cursor}
        totalCount={totalCount}
        fetcher={fetchNextPages}
        site={site}
      />
    </Layout>
  );
}

export async function getStaticProps() {
  // Fetch the site and articles in parallel
  const [site, { data: articles, totalCount, cursor }] = await Promise.all([
    PCCConvenienceFunctions.getSite(),
    PCCConvenienceFunctions.getPaginatedArticles({
      pageSize: PAGE_SIZE,
    }),
  ]);

  return {
    props: {
      articles,
      cursor,
      totalCount,
      site,
    },
    // ISR with a short lifetime results in new content appearing pretty quickly.
    // Without this setting (or something similar) this page
    // renders "dynamically," but with a long s-maxage
    // (cache-control: s-maxage=31536000)
    // With this "revalidate" value, the cache control header changes to
    // cache-control: s-maxage=5, stale-while-revalidate=31535995
    // See https://github.com/pantheon-systems/documentation/issues/9777
    // for more detail/discussion.
    revalidate: 5,
  };
}
