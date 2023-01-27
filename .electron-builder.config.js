if (process.env.VITE_APP_VERSION === undefined) {
  /**
   * @param {Date} date
   * @return {number} the ordinal number of the day of the year
   */
  const dayOfYear = date =>
    Math.floor((date - new Date(date.getUTCFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

  /**
   *
   * @param date
   * @return {number} the ordinal number of the minute of the day
   */
  const minuteOfDay = date => date.getUTCHours() * 60 + date.getUTCMinutes();

  const now = new Date();
  process.env.VITE_APP_VERSION = `${now.getUTCFullYear() - 2000}.${dayOfYear(now)}.${minuteOfDay(
    now,
  )}`;
}

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: 'io.github.lunarequest.Nightpdf-nx',
  productName: 'NightPDF-nx',
  fileAssociations: [
    {
      ext: 'pdf',
      icon: 'buildResources/icon.icns',
      role: 'viewer',
      isPackage: false,
    },
  ],
  directories: {
    output: 'dist',
    buildResources: 'buildResources',
  },
  files: ['packages/**/dist/**'],
  extraMetadata: {
    version: process.env.VITE_APP_VERSION,
  },
  linux: {
    desktop: {
      Name: 'NightPDF-nx',
      Comment: 'Dark mode PDF reader',
    },
    icon: 'buildResources/icon.icns',
    publish: ['github'],
    target: ['AppImage', 'deb', 'rpm'],
    category: 'Utilty',
  },
  win: {
    publish: ['github'],
    target: ['nsis', 'portable'],
    icon: 'buildResources/icon.ico',
  },
  mac: {
    publish: ['github'],
    category: 'public.app-category.productivity',
    target: ['dmg', 'zip'],
    bundleVersion: 1,
    artifactName: 'NightPDF-nx-${version}.${ext}',
    hardenedRuntime: true,
    darkModeSupport: true,
    gatekeeperAssess: false,
    type: 'distribution',
  },
};

module.exports = config;
