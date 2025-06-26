export interface AboutSection {
    id: string
    title: string
    content: string[]
    images?: AboutImage[]
}

export interface AboutImage {
    id: string
    src: string
    alt: string
    caption: string
}

export interface AboutConfig {
    hero: {
        avatar: string
        signature: string
        leftTags: string[]
        rightTags: string[]
    }
    intro: {
        title: string
        content: string[]
        logo: string
    }
    sections: AboutSection[]
}
