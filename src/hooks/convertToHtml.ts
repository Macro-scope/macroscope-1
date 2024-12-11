// // import { Provider } from "react-redux";
// // import { renderToStaticMarkup, renderToString } from "react-dom/server";
// // import PannableCanvas from "../components/MapCanvas/PannableCanvas";
// // import { store } from "../redux/store";
// // import { uploadHtmlToS3 } from "../config/aws-uploader";
// // import WebsiteViewContent from "../components/Website/WebsiteView/WebsiteViewContent/WebsiteViewContent";

// // let htmlContent = "";

// export const convertToHtml = async (mapId: string, componentHtml: any, navbarHtml: any) => {
//   // const componentHtml = renderToStaticMarkup(WebsiteViewContent);
//   // Fetch Tailwind CSS
//   fetch("https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css")
//     .then((response) => response.text())
//     .then((tailwindCss) => {
//       const fullHtml = `
//           <!DOCTYPE html>
//           <html lang="en">
//           <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>Converted React Component</title>
//             <style>${tailwindCss}
//             #root{
//             overflow: hidden !important;
//             }
//             .mainCanvas{
//               overflow: scroll !important;
//               z-index: 1;
//             }
//               .mappedCards{
//               z-index: 1000;
//               }
//               /* width */
//               ::-webkit-scrollbar {
//                   width: 10px;
//               }

//               /* Track */
//               ::-webkit-scrollbar-track {
//                   background: #f1f1f1;
//               }

//               /* Handle */
//               ::-webkit-scrollbar-thumb {
//                   background: #888;
//                   border-radius: 5px;
//               }

//               /* Handle on hover */
//               ::-webkit-scrollbar-thumb:hover {
//                   background: #555;
//               }
//               .zoom-controls{
//                 display: none !important;
//               }
//             </style>
//             <script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
//             <script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
//           </head>
//           <body>
//           <div id="root">
//           ${navbarHtml}
//             ${componentHtml}
//             </div>
//             <script>
//             ReactDOM.hydrate(React.createElement(SampleComponent), document.getElementById('root'));
//             ${componentHtml.toString()}
//             </script>
//           </body>
//           </html>
//         `;
//       htmlContent = fullHtml;
//       // saveHtmlFile();
//       // return uploadHtmlToS3(mapId, htmlContent)
//     });
// };

// // const saveHtmlFile = () => {
// //   const blob = new Blob([htmlContent], { type: "text/html" });
// //   const url = URL.createObjectURL(blob);
// //   const link = document.createElement("a");
// //   link.href = url;
// //   link.download = "converted-component.html";
// //   document.body.appendChild(link);
// //   link.click();
// //   document.body.removeChild(link);
// //   URL.revokeObjectURL(url);
// // };
