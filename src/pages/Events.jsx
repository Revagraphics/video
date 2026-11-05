import VideoGallery from "../components/VideoGallery";
import video1 from "../assets/videos/bics.mp4";
import video2 from "../assets/videos/prd-1.mp4";
import video3 from "../assets/videos/prd-2.mp4";
import video4 from "../assets/videos/prd-3.mp4";
import video5 from "../assets/videos/vineet.mp4";

const works = [
  {
    id: 1,
    title: "Brand Promotion",
    description: "Creative brand promotional video",
    category: "Branding",
    videoUrl: video1,
  },
  {
    id: 2,
    title: "Brand Promotion",
    description: "Product showcase and advertising",
    category: "Advertisement",
    videoUrl: video2,
  },
  {
    id: 3,
    title: "Social Media Reel",
    description: "Creative Instagram reel",
    category: "Social Media",
    videoUrl: video3,
  },
  {
    id: 4,
    title: "Social Media Reel",
    description: "Creative Instagram reel",
    category: "Social Media",
    videoUrl: video4,
  },
  {
    id: 5,
    title: "Social Media Reel",
    description: "Creative Instagram reel",
    category: "Social Media",
    videoUrl: video5,
  },
];

export default function Events() {
  return (
    <VideoGallery
      works={works}
      name="Creative Portfolio"
      eyebrow="Our latest work"
    />
  );
}
