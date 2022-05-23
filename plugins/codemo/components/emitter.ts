import Mitt from "mitt";

const emitter = Mitt<{change: string}>();

export { emitter };
