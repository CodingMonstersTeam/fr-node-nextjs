import { Component } from "react";
import type { Human, Config } from '@vladmandic/human';
import { log, status } from './logging';

const config: Partial<Config> = {
  debug: false,
  modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models',
  face: {
    enabled: true,
    detector: { rotation: true, return: true, mask: false },
    description: { enabled: true },
  },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
}

interface Props { 
  inputId: string, 
  outputId: string,
  image?: HTMLImageElement;
};
interface State { 
  ready: boolean, 
  frame: number, 
  faceMatch?: { name: string; similarity: number } 
};

class RunHuman extends Component<Props, State> {
  HumanImport: any;
  human: Human | undefined = undefined;
  video: HTMLVideoElement | undefined = undefined;
  canvas: HTMLCanvasElement | undefined = undefined;
  timestamp: number = 0;
  fps: number = 0;
  faceImage: HTMLImageElement | undefined = undefined; // For face matching

  constructor(props: Props) {
    super(props);
    this.state = {
      ready: false,
      frame: 0,
      faceMatch: undefined,
    };

    if (typeof document === 'undefined') return;

    this.video = document.getElementById(this.props.inputId) as (HTMLVideoElement | undefined) || document.createElement('video');
    this.canvas = document.getElementById(this.props.outputId) as (HTMLCanvasElement | undefined) || document.createElement('canvas');

    import('@vladmandic/human').then((H) => {
      this.human = new H.default(config) as Human;
      log('human version:', this.human.version, '| tfjs version:', this.human.tf.version['tfjs-core']);
      log('platform:', this.human.env.platform, '| agent:', this.human.env.agent);
      status('loading models...');
      this.human.load().then(() => {
        log('backend:', this.human!.tf.getBackend(), '| available:', this.human!.env.backends);
        log('loaded models:' + Object.values(this.human!.models).filter((model) => model !== null).length);
        status('initializing...');
        this.human!.warmup().then(() => {
          this.setState({ ready: true });
          status('ready...');
        });
      });
    });
  }

  async componentDidMount() {
    if (this.video) this.video.onresize = () => {
      this.canvas!.width = this.video!.videoWidth;
      this.canvas!.height = this.video!.videoHeight; 
    }
    if (this.canvas) this.canvas.onclick = () => {
      this.video?.paused ? this.video?.play() : this.video?.pause();
    }
    // Load the face image for matching
    await this.loadFaceImage();
  }

  async componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.state.ready && prevState.ready !== this.state.ready) {
      await this.detect();
    }
  }

  override render() {
    if (!this.video || !this.canvas || !this.human || !this.human.result) return null;

    if (!this.video.paused) {
      const interpolated = this.human.next(this.human.result);
      this.human.draw.canvas(this.video, this.canvas);
      this.human.draw.all(this.canvas, interpolated);
    }

    status(this.video.paused ? 'paused' : `fps: ${this.fps.toFixed(1).padStart(5, ' ')}`);
    return (
      <div>
        {this.state.faceMatch && (
          <div className="face-match">
            Best Match: {this.state.faceMatch.name} | Similarity: {this.state.faceMatch.similarity.toFixed(2)}
          </div>
        )}
      </div>
    );
  }

  async detect() {
    if (!this.human || !this.video || !this.canvas) return;

    // Detect faces in the video
    await this.human.detect(this.video);

    // Check if `this.faceImage` and `this.human.result` are defined and if `face` is present
    if (this.faceImage && this.human.result && this.human.result.face) {
      const faceEmbedding = this.human.result.face.embedding;

      if (faceEmbedding) {
        // Perform matching with faceEmbedding and the loaded image
        const imageEmbedding = await this.human.describe(this.faceImage);
        const result = await this.human.match.find(faceEmbedding, [imageEmbedding]);

        if (result && result.index !== -1) {
          const bestMatch = {
            name: 'Face Image', // You might want to set a more meaningful name here
            similarity: result.similarity
          };
          this.setState({ faceMatch: bestMatch });
        } else {
          this.setState({ faceMatch: { name: 'No Match', similarity: 0 } });
        }
      }
    }

    const now = this.human.now();
    this.fps = 1000 / (now - this.timestamp);
    this.timestamp = now;
    this.setState({ frame: this.state.frame + 1 });
  }

  async loadFaceImage() {
    // Load the single face image for matching
    this.faceImage = new Image();
    this.faceImage.src = 'matt01.png'; // Path to the single face image
    await new Promise((resolve) => {
      this.faceImage!.onload = () => resolve(true);
      this.faceImage!.onerror = () => resolve(false);
    });
    log('Loaded face image for matching');
  }
}

export default RunHuman;

