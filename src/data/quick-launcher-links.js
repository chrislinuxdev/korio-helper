export const config = {
  groups: [
    {
      name: 'Development',
      links: ['GitHub', 'ArgoCD - Dev', 'ArgoCD - Test', 'ArgoCD - Platform', 'ArgoCD - Staging', 'ArgoCD - Prod'],
    },
    {
      name: 'Alpheus Jira Tickets',
      links: ['Alpheus CV01-201 Board'],
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
    type: 'external',
  },
  {
    title: 'ArgoCD - Dev',
    url: 'https://argocd-dev.korioclinical.com',
    type: 'external',
  },
  {
    title: 'ArgoCD - Test',
    url: 'https://argocd-test.korioclinical.com',
    type: 'external',
  },
  {
    title: 'ArgoCD - Platform',
    url: 'https://argocd-platform.korioclinical.com',
    type: 'external',
  },
  {
    title: 'ArgoCD - Staging',
    url: 'https://argocd-staging.korioclinical.com',
    type: 'external',
  },
  {
    title: 'ArgoCD - Prod',
    url: 'https://argocd-prod.korioclinical.com',
    type: 'external',
  },
  {
    title: 'Local Project Folder',
    url: 'file:///Users/chris/Documents/projects',
    type: 'file',
  },
  {
    title: 'Alpheus CV01-201 Board',
    url: 'https://korioclinical.atlassian.net/jira/software/c/projects/AC201/boards/277?assignee=6307ed82ec02b5f28b636277',
    type: 'external',
  },
  {
    title: 'Documentation',
    url: 'file:///Users/chris/Documents/docs/manual.pdf',
    type: 'file',
  },
  {
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    type: 'external',
  },
  {
    title: 'Personal Blog',
    url: 'https://www.chrisblog.com',
    type: 'external',
  },
  {
    title: 'Notes',
    url: 'file:///Users/chris/Documents/notes.txt',
    type: 'file',
  },
];
