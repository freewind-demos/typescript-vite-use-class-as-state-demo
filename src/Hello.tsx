import React, {FC, useState, useMemo} from 'react';
import {WritableKeys} from 'ts-essentials';

type Props = {};

type WritableFields<T extends {}> = Pick<T, WritableKeys<T>>;

class User {
  private name!: string;

  constructor(props: WritableFields<User>, private onChange: () => void) {
    Object.assign(this, props);
  }

  #action<T>(fn: () => T): () => T;
  #action<T>(fn: () => Promise<T>): () => T;
  #action<T>(fn: () => T | Promise<T>): () => T | Promise<T> {
    return () => {
      let isPromise = false;
      try {
        const result = fn();
        if (result !== null && typeof result === 'object' && 'then' in result) {
          isPromise = true;
          return result.finally(this.onChange)
        }
        return result;
      } finally {
        if (!isPromise) this.onChange();
      }
    }
  }

  readonly changeName = this.#action(() => {
    this.name = `New name: ${Date.now()}`
  });

  readonly asyncChangeName = this.#action(async () => {
    this.name = `Async new name: ${Date.now()}`
  })
}

export const Hello: FC<Props> = ({}) => {
  console.log("### > Hello",)

  const [, update] = useState({});
  const user = useMemo(() => new User({name: 'React'}, () => update({})), []);

  return <div className={'Hello'}>
    <h1>Hello {JSON.stringify(user)}</h1>
    <button type={'button'} onClick={() => user.changeName()}>Modify</button>
    <button type={'button'} onClick={async () => await user.asyncChangeName()}>Modify Async</button>
  </div>;
}
