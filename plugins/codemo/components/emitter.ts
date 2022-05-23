import Mitt from "mitt";

const emitter = Mitt<{
  show: {
    lang?: string;
    code: string;
  }
}>();

export { emitter };
