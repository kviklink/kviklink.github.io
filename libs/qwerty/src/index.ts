import { add } from 'asdf';
import { sub } from 'asdf';

export function test(): number {
    return add(1, 2) + sub(5, 2, true);
}
