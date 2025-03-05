class DatabaseClass {
  #table;
  #primaryFilter;

  constructor(table, primaryFilter) {
    this.#table = table;
    this.#primaryFilter = primaryFilter;
  }

  #values = {};
  set(key, value) {
    this.#values[key] = value;
  }

  async create() {}

  async read() {
    const record = await this.#table.read({
      record: '*',
      filter: this.#primaryFilter,
    });

    for (const field in record) {
      const value = record[field];

      if (this.#values[field] === undefined) {
        const desc = Object.getOwnPropertyDescriptor(
          Object.getPrototypeOf(this),
          field
        );

        Object.defineProperty(this, field, {
          get:
            desc?.get === undefined
              ? () => {
                  return this.#values[field];
                }
              : desc.get,
          set:
            desc?.set === undefined
              ? (v) => {
                  this.#values[field] = v;
                }
              : desc.set,
        });
      }

      this.#values[field] = value;
    }
  }

  async update() {}

  async delete() {}
}

class B extends DatabaseClass {
  constructor() {
    super(tt);
  }

  check() {
    this.doom();
  }

  set name(v) {
    this.set('name', 'aaaa' + v);
  }
}

const tt = 'boom';

const b = new B();

b.check();

console.log(b.name);

b.name = 'q';

console.log(b.name);
