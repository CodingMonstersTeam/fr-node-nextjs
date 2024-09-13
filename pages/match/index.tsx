import type { NextPage } from 'next'
import Head from 'next/head'
import InitWebCam from '../../components/InitWebCam'
import styles from '../../styles/elements.module.css'
import RunHumanMatch from '../../components/RunHumanMatch'
import { useState, useEffect } from 'react';

const Index: NextPage = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    // Load or set your image here
    const img = new Image();
    img.src = 'matt01.png'; // Replace with the path to your image
    img.onload = () => setImage(img);
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Human</title>
        <meta name="description" content="Human: Demo with TypeScript/ReactJS/NextJS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <canvas id="canvas" className={styles.output} />
      <video id="video" className={styles.webcam} autoPlay muted />
      <div id="status" className={styles.status}></div>
      <div id="log" className={styles.log}></div>
      <div id="performance" className={styles.performance}></div>
      <InitWebCam elementId="video"/>
      <RunHumanMatch inputId="video" outputId="canvas" image={image} />
    </div>
  )
}

export default Index;


