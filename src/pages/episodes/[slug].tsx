import Image from 'next/image';
import Link from 'next/link';
import { GetStaticPaths, GetStaticProps } from 'next';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Head from 'next/head';
import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import styles from './episode.module.scss';
import { usePlayer } from '../../contexts/PlayerContext';

interface Episode {
  id: string;
  title: string;
  members: string;
  thumbnail: string;
  file: {
    duration: number;
    durationAsString: string;
    url: string;
  };
  description: string;
  publishedAt: string;
}

interface EpisodeProps {
  episode: Episode;
}

export default function Episode({ episode }: EpisodeProps): JSX.Element {
  const { play } = usePlayer();
  return (
    <div className={styles.episode}>
      <Head>
        <title>{`${episode.title} | Podcastr`}</title>
      </Head>
      <div className={styles.thumbnailContainer}>
        <button type="button">
          <Link href="/">
            <a>
              <img src="/arrow-left.svg" alt="Voltar" />
            </a>
          </Link>
        </button>
        <Image
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit="cover"
        />
        <button type="button" onClick={() => play(episode)}>
          <img src="/play.svg" alt="Tocar episódio" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.file.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await api.get('/episodes');

  const paths = data.map(episode => {
    return {
      params: {
        slug: episode.id,
      },
    };
  });
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const { data } = await api.get(`/episodes/${slug}`);

  const episode = {
    id: data.id,
    title: data.title,
    members: data.members,
    thumbnail: data.thumbnail,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', {
      locale: ptBR,
    }),
    description: data.description,
    file: {
      url: data.file.url,
      duration: data.file.duration,
      durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    },
  };

  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24, // 24 hrs
  };
};
