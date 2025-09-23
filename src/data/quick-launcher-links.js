export const config = {
  groups: [
    {
      name: 'Development',
      links: ['GitHub', 'ArgoCD - Dev', 'ArgoCD - Test', 'ArgoCD - Platform', 'ArgoCD - Staging', 'ArgoCD - Prod'],
    },
    {
      name: 'Reference',
      links: ['Stack Overflow', 'Documentation'],
    },
    {
      name: 'Personal',
      links: ['Personal Blog', 'Notes'],
    },
    {
      name: 'Local Files',
      links: ['Local Project Folder'],
    },
  ],
  placeholders: ['System Monitor', 'Recent Files', 'Quick Notes', 'Weather'],
};

export const links = [
  {
    title: 'GitHub',
    url: 'https://www.github.com',
    type: 'web',
  },
  {
    title: 'ArgoCD - Dev',
    url: 'https://argocd-dev.korioclinical.com',
    type: 'web',
  },
  {
    title: 'ArgoCD - Test',
    url: 'https://argocd-test.korioclinical.com',
    type: 'web',
  },
  {
    title: 'ArgoCD - Platform',
    url: 'https://argocd-platform.korioclinical.com',
    type: 'web',
  },
  {
    title: 'ArgoCD - Staging',
    url: 'https://argocd-staging.korioclinical.com',
    type: 'web',
  },
  {
    title: 'ArgoCD - Prod',
    url: 'https://argocd-prod.korioclinical.com',
    type: 'web',
  },
  {
    title: 'Local Project Folder',
    url: 'file:///Users/chris/Documents/projects',
    type: 'file',
  },
  {
    title: 'Documentation',
    url: 'file:///Users/chris/Documents/docs/manual.pdf',
    type: 'file',
  },
  {
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    type: 'web',
  },
  {
    title: 'Personal Blog',
    url: 'https://www.chrisblog.com',
    type: 'web',
  },
  {
    title: 'Notes',
    url: 'file:///Users/chris/Documents/notes.txt',
    type: 'file',
  },
];
