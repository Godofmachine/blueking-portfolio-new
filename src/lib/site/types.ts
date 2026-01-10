export type LandingSettings = {
  socialLinks?: unknown;
  header: {
    logoUrl: string;
    resumeUrl: string;
  };
  hero: {
    name: string;
    roles: string[];
    tagline: string;
    ctaLabel: string;
    ctaToastTitle: string;
    ctaToastDescription: string;
  };
  about: {
    profileImageUrl: string;
    profileName: string;
    location: string;
    experienceLabel: string;
    projectsLabel: string;
    paragraphs: string[];
    philosophyTitle: string;
    philosophyText: string;
    technicalTitle: string;
    technicalText: string;
    resumeUrl: string;
    resumeLabel: string;
  };
  contact: {
    web3formsAccessKey: string;
    email: string;
    phone: string;
    location: string;
    workingHours: string;
    xUrl: string;
    githubUrl: string;
    socials: Array<{
      label: string;
      url: string;
      visible: boolean;
    }>;
  };
  footer: {
    displayName: string;
    subtitle: string;
    githubUrl: string;
    xUrl: string;
    socials: Array<{
      label: string;
      url: string;
      visible: boolean;
    }>;
    buyMeCoffeeUrl: string;
    buyMeCoffeeVisible: boolean;
    madeWithText: string;
  };
};
