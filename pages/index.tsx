import type { NextPage } from 'next'
import Head from 'next/head'
import InitWebCam from '../components/InitWebCam'
import styles from '../styles/elements.module.css'
import RunHuman from '../components/RunHuman'

const Index: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Human</title>
        <meta name="description" content="Human: Demo with TypeScript/ReactJS/NextJS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <canvas id="canvas" className={styles.output} /> {/* placeholder element that will be used by human for output */}
      <video id="video" className={styles.webcam} autoPlay muted /> {/* placeholder element that will be used by webcam */}
      <div id="status" className={styles.status}></div>
      <div id="log" className={styles.log}></div>
      <div id="performance" className={styles.performance}></div>
      <InitWebCam elementId="video"/> {/* initialized webcam using htmlvideo element with specified id */}
      <RunHuman inputId="video" outputId="canvas"/> {/* loads and start human using specified input video element and output canvas element */}

     
    </div>
  )
}

export default Index
