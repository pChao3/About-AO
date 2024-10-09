import Image from 'next/image';
import { Inter } from '@next/font/google';
import styles from '@/styles/Home.module.css';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import Testimonials from '@/components/home/Testimonials';
import GenerationStep from '@/components/home/GenerationStep';
import FeatureSection from '@/components/home/FeatureSection';
import PageMetaTags from '@/containers/PageMetaTags';
import CTA2 from '@/components/home/CTA2';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-auto">
        <Image
          src="/whale.jpg" // 使用public文件夹中的图片
          alt="Whale"
          layout="responsive" // 设置为��应式布局
          width={100} // 设定宽度为100%
          height={100} // 设定高度为100%
        />
        <div className="absolute right-1/4">
          <p className="text-2xl text-center">AO-超并行计算机</p>
          <button
            onClick={() => window.open('https://cookbook_ao.g8way.io/zh/welcome/index.html')}
            className="border border-black rounded-sm bg-gray-300 hover:text-blue-500 mt-4"
          >
            中文官网
          </button>
        </div>
      </div>
    </>
  );
}
