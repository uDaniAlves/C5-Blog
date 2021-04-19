import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router'
import Header from '../../components/Header';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'
import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { useMemo } from 'react';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}: PostProps) {

  const router = useRouter()
  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  
  
  const readingTime = useMemo(() => {
    const postText = post.data.content.map(content => {
      //content.body.reduce(sum)
      return(RichText.asText(content.body))
    })

    return Math.ceil(postText.join(" ").split(" ").length / 200)
  }, [post.data.content])
  

  return (
    <>
      <Header/>
      <main >
        <section className={styles.postImageSection}>
          <img src={post.data.banner.url} alt=""/>
        </section>
        <section className={`${commonStyles.container} ${styles.postSection}`}>
          <h1>{post.data.title}</h1>
          <div>
            <time><FiCalendar/>
            {
              format(
                new Date(post.first_publication_date),
                "dd MMM yyyy",
                {
                  locale: ptBR,
                }
              )
            }
            </time>
            <p>
              <FiUser/>{post.data.author}
            </p>
            <FiClock/><p>{readingTime} min</p>
          </div>
          {post.data.content.map( (content, index) => {
            return (
              <section key={index} className={styles.postSubSection}>
                <div >
                  <h2>{content.heading}</h2>
                  <div dangerouslySetInnerHTML={{__html: RichText.asHtml(content.body)}} />
                </div>
              </section>
            )
          })}
        </section>
      </main>
    </>

  )
}



export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ],{},);

  const postSlugs = postsResponse.results.map(post => (post.uid) )
  
  // TODO
  return {
    paths: 
      postSlugs.map(slug => {
        return {params: {
          slug
        }}
      })
    ,
    fallback: true // true, false. 'blocking'
  }
};

export const getStaticProps: GetStaticProps = async context => {
  
  const prismic = getPrismicClient();
  const post = await prismic.getByUID('posts', String(context.params.slug), {});

  //console.log(JSON.stringify(post, null, 2))
  
  const postFormatted: Post = {
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      banner: {
        url: post.data.banner.url,
      },
      author: post.data.author,
      content: post.data.content.map(content => {
        return {
          heading: content.heading,
          body: content.body
        }
      })  
      ,
    }
  }

  //console.log(JSON.stringify(postFormatted, null, 2))

  return {
    props:{
      post: postFormatted
    },
    revalidate: 60*60*24, //24horas
  }
};
