export interface WorkCategory {
  icon: string;
  title: string;
  description: string;
  workUrl: string;
}

export interface HomePageType {
  video: string;
  image: string;
  worksCategory: WorkCategory[];
}

export interface PublishedWork {
  _id: string;
  title: string;
  slug: string;
}

export interface Card {
  image: string;
  name: string;
  birthDate: string;
  deathDate: string;
  birthPlace: string;
  majorEducationalInstitution: string;
  publishedWorks: PublishedWork[];
}

export interface Timeline {
  title: string;
  date: string;
}

export interface Biography {
  description: string;
  card: Card;
  timeline: Timeline[];
}

export interface Book {
  _id: string;
  title: string;
  description: string;
  url: string;
  slug: string;
  coverImage: string;
}

export type NavparDataType = {
  link: string;
  title: string;
};

export interface LessonType {
  title: string;
  description: string;
  image: string;
  url: string;
}

export interface LessonsPageType {
  image: string;
  url: string;
  lessons: LessonType[];
}

export interface GalleryPhoto {
  image: string;
  caption: string;
}
