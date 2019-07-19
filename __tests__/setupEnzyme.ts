import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { JSDOM } from "jsdom";

configure({ adapter: new Adapter() });

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      document: Partial<Document>;
      window: Partial<Window>;
      navigator: Partial<Navigator>;
    }
  }
}

const jsdom = new JSDOM("<!doctype html><html><body></body></html>");
const { window } = jsdom;

function copyProps(src: any, target: any) {
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target)
  });
}

global["window"] = window;
global["document"] = window.document;
global["navigator"] = {
  userAgent: "node.js"
};
global["requestAnimationFrame"] = function(callback: any) {
  return setTimeout(callback, 0);
};
global["cancelAnimationFrame"] = function(id: any) {
  clearTimeout(id);
};
copyProps(window, global);
