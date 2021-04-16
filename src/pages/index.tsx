import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination}: HomeProps) {
  return (
    <main className={styles.mainSection}>
      <section className={styles.logoSection}>
        <img src="./Logo.svg" alt="logo"/>
      </section>
      <section className={styles.postSection}>
        {postsPagination.results.map(post => (
            <a key={post.uid}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div>
                <time><FiCalendar/>{post.first_publication_date}</time>
                <span><FiUser/>{post.data.author}</span>
              </div>
            </a>
          )
        )}
      </section>
    </main>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  
  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ],
    { pageSize: 25 },
  );

  const posts = postsResponse.results.map(post => {
    return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          "dd MMM yyyy",
          {
            locale: ptBR,
          }
        ),
        data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  return {
    props: { 
      postsPagination: {
        next_page: postsResponse.next_page ? postsResponse.next_page : null,
        results: posts
      }
    },
  };
};
