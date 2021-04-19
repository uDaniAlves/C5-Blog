import next, { GetStaticProps } from 'next';
import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi'
import Link from 'next/link';
import { RichText } from 'prismic-dom';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

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

  const [postsList, setPostsList] = useState(postsPagination)
  

  const handleLoadPosts = async () => {

    const nextPage = await fetch(postsList.next_page)
    .then(response => response.json())

    const newPosts = nextPage.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date:post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        }
      }
    })

    const updatedPostList: PostPagination = {
      next_page: nextPage.next_page,
      results: [
        ...postsList.results,
        ...newPosts,
      ]
    }
    
    setPostsList(updatedPostList)
    
  }

  return (
    <main className={commonStyles.container}>
      <section className={styles.logoSection}>
        <img src="./Logo.svg" alt="logo"/>
      </section>
      <section className={styles.postSection}>
        {postsList.results.map(post => (
            <div key={post.uid} >
              <Link href={`/post/${post.uid}`}>
                <a >
                  <h1>{post.data.title}</h1>
                </a>
              </Link>
              <p>{post.data.subtitle}</p>
              <div>
                <time>
                  <FiCalendar/>{
                  format(
                    new Date(post.first_publication_date),
                    "dd MMM yyyy",
                    {
                      locale: ptBR,
                    }
                  )}
                </time>
                <span>
                  <FiUser/>{post.data.author}
                </span>
              </div>
            </div>
          )
        )}
      </section>
      { postsList.next_page != null && 
        <section className={styles.footerSection}>
          <button onClick={handleLoadPosts}>
            Carregar mais posts
          </button>
        </section>
        
      }
    </main>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  
  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ],
    { 
    fetch: ['posts.title', 'posts.subtitle', 'posts.author', 'posts.uid', 'post.first_publication_date'],
    pageSize: 2 
  },
  );

  const posts = postsResponse.results.map(post => {
    return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
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
