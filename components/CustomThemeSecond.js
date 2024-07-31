// components/customTheme.js
import {Flowbite } from 'flowbite-react';

const customThemesecond = {
  theme: {
    card: {
        "root": {
            "base": "flex rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800",
            "children": "flex h-full flex-col justify-center gap-1 lg:gap-4 p-2 md:p-4",
        }
    },
    accordion: {
      "root": {
        "base": "divide-y divide-none border-none",
        "flush": {
          "off": "rounded-none border-none",
          "on": "border-none"
        }
        },
        "content": {
          "base": "p-2"
        },
        "title": {
          "arrow": {
            "base": "h-6 w-6 shrink-0",
            "open": {
              "off": "",
              "on": "rotate-180"
            }
          },
          "base": "flex w-full items-center justify-between p-2 text-left font-bold text-gray-500",
          "flush": {
            "off": "hover:bg-gray-100 ",
            "on": "bg-transparent dark:bg-transparent"
          },
          "heading": "",
          "open": {
            "off": "",
            "on": "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
          }
        }
      }
    // Tambahkan kustomisasi komponen lainnya
  },
};

const CustomThemeProviderSecond = ({ children }) => {
  return <Flowbite theme={customThemesecond}>{children}</Flowbite>;
};

export default CustomThemeProviderSecond;
