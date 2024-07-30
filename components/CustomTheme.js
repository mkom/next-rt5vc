// components/customTheme.js
import {Flowbite } from 'flowbite-react';

const customTheme = {
  theme: {
    card: {
        "root": {
            "base": "flex rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800",
            "children": "flex h-full flex-col justify-center gap-1 lg:gap-4 p-4",
        }
    }
    // Tambahkan kustomisasi komponen lainnya
  },
};

const CustomThemeProvider = ({ children }) => {
  return <Flowbite theme={customTheme}>{children}</Flowbite>;
};

export default CustomThemeProvider;
