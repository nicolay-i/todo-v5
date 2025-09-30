
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Todo
 * 
 */
export type Todo = $Result.DefaultSelection<Prisma.$TodoPayload>
/**
 * Model PinnedList
 * 
 */
export type PinnedList = $Result.DefaultSelection<Prisma.$PinnedListPayload>
/**
 * Model PinnedTodo
 * 
 */
export type PinnedTodo = $Result.DefaultSelection<Prisma.$PinnedTodoPayload>
/**
 * Model Tag
 * 
 */
export type Tag = $Result.DefaultSelection<Prisma.$TagPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Todos
 * const todos = await prisma.todo.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Todos
   * const todos = await prisma.todo.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.todo`: Exposes CRUD operations for the **Todo** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Todos
    * const todos = await prisma.todo.findMany()
    * ```
    */
  get todo(): Prisma.TodoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.pinnedList`: Exposes CRUD operations for the **PinnedList** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PinnedLists
    * const pinnedLists = await prisma.pinnedList.findMany()
    * ```
    */
  get pinnedList(): Prisma.PinnedListDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.pinnedTodo`: Exposes CRUD operations for the **PinnedTodo** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PinnedTodos
    * const pinnedTodos = await prisma.pinnedTodo.findMany()
    * ```
    */
  get pinnedTodo(): Prisma.PinnedTodoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tag`: Exposes CRUD operations for the **Tag** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tags
    * const tags = await prisma.tag.findMany()
    * ```
    */
  get tag(): Prisma.TagDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.16.2
   * Query Engine version: 1c57fdcd7e44b29b9313256c76699e91c3ac3c43
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Todo: 'Todo',
    PinnedList: 'PinnedList',
    PinnedTodo: 'PinnedTodo',
    Tag: 'Tag'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "todo" | "pinnedList" | "pinnedTodo" | "tag"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Todo: {
        payload: Prisma.$TodoPayload<ExtArgs>
        fields: Prisma.TodoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TodoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TodoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TodoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TodoPayload>
          }
          findFirst: {
            args: Prisma.TodoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TodoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TodoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TodoPayload>
          }
          findMany: {
            args: Prisma.TodoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TodoPayload>[]
          }
          create: {
            args: Prisma.TodoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TodoPayload>
          }
          createMany: {
            args: Prisma.TodoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TodoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TodoPayload>[]
          }
          delete: {
            args: Prisma.TodoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TodoPayload>
          }
          update: {
            args: Prisma.TodoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TodoPayload>
          }
          deleteMany: {
            args: Prisma.TodoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TodoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TodoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TodoPayload>[]
          }
          upsert: {
            args: Prisma.TodoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TodoPayload>
          }
          aggregate: {
            args: Prisma.TodoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTodo>
          }
          groupBy: {
            args: Prisma.TodoGroupByArgs<ExtArgs>
            result: $Utils.Optional<TodoGroupByOutputType>[]
          }
          count: {
            args: Prisma.TodoCountArgs<ExtArgs>
            result: $Utils.Optional<TodoCountAggregateOutputType> | number
          }
        }
      }
      PinnedList: {
        payload: Prisma.$PinnedListPayload<ExtArgs>
        fields: Prisma.PinnedListFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PinnedListFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedListPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PinnedListFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedListPayload>
          }
          findFirst: {
            args: Prisma.PinnedListFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedListPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PinnedListFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedListPayload>
          }
          findMany: {
            args: Prisma.PinnedListFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedListPayload>[]
          }
          create: {
            args: Prisma.PinnedListCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedListPayload>
          }
          createMany: {
            args: Prisma.PinnedListCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PinnedListCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedListPayload>[]
          }
          delete: {
            args: Prisma.PinnedListDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedListPayload>
          }
          update: {
            args: Prisma.PinnedListUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedListPayload>
          }
          deleteMany: {
            args: Prisma.PinnedListDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PinnedListUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PinnedListUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedListPayload>[]
          }
          upsert: {
            args: Prisma.PinnedListUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedListPayload>
          }
          aggregate: {
            args: Prisma.PinnedListAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePinnedList>
          }
          groupBy: {
            args: Prisma.PinnedListGroupByArgs<ExtArgs>
            result: $Utils.Optional<PinnedListGroupByOutputType>[]
          }
          count: {
            args: Prisma.PinnedListCountArgs<ExtArgs>
            result: $Utils.Optional<PinnedListCountAggregateOutputType> | number
          }
        }
      }
      PinnedTodo: {
        payload: Prisma.$PinnedTodoPayload<ExtArgs>
        fields: Prisma.PinnedTodoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PinnedTodoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedTodoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PinnedTodoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedTodoPayload>
          }
          findFirst: {
            args: Prisma.PinnedTodoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedTodoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PinnedTodoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedTodoPayload>
          }
          findMany: {
            args: Prisma.PinnedTodoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedTodoPayload>[]
          }
          create: {
            args: Prisma.PinnedTodoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedTodoPayload>
          }
          createMany: {
            args: Prisma.PinnedTodoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PinnedTodoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedTodoPayload>[]
          }
          delete: {
            args: Prisma.PinnedTodoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedTodoPayload>
          }
          update: {
            args: Prisma.PinnedTodoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedTodoPayload>
          }
          deleteMany: {
            args: Prisma.PinnedTodoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PinnedTodoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PinnedTodoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedTodoPayload>[]
          }
          upsert: {
            args: Prisma.PinnedTodoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PinnedTodoPayload>
          }
          aggregate: {
            args: Prisma.PinnedTodoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePinnedTodo>
          }
          groupBy: {
            args: Prisma.PinnedTodoGroupByArgs<ExtArgs>
            result: $Utils.Optional<PinnedTodoGroupByOutputType>[]
          }
          count: {
            args: Prisma.PinnedTodoCountArgs<ExtArgs>
            result: $Utils.Optional<PinnedTodoCountAggregateOutputType> | number
          }
        }
      }
      Tag: {
        payload: Prisma.$TagPayload<ExtArgs>
        fields: Prisma.TagFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TagFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TagFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          findFirst: {
            args: Prisma.TagFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TagFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          findMany: {
            args: Prisma.TagFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>[]
          }
          create: {
            args: Prisma.TagCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          createMany: {
            args: Prisma.TagCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TagCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>[]
          }
          delete: {
            args: Prisma.TagDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          update: {
            args: Prisma.TagUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          deleteMany: {
            args: Prisma.TagDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TagUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TagUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>[]
          }
          upsert: {
            args: Prisma.TagUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          aggregate: {
            args: Prisma.TagAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTag>
          }
          groupBy: {
            args: Prisma.TagGroupByArgs<ExtArgs>
            result: $Utils.Optional<TagGroupByOutputType>[]
          }
          count: {
            args: Prisma.TagCountArgs<ExtArgs>
            result: $Utils.Optional<TagCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    todo?: TodoOmit
    pinnedList?: PinnedListOmit
    pinnedTodo?: PinnedTodoOmit
    tag?: TagOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type TodoCountOutputType
   */

  export type TodoCountOutputType = {
    children: number
    pinnedIn: number
    tags: number
  }

  export type TodoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    children?: boolean | TodoCountOutputTypeCountChildrenArgs
    pinnedIn?: boolean | TodoCountOutputTypeCountPinnedInArgs
    tags?: boolean | TodoCountOutputTypeCountTagsArgs
  }

  // Custom InputTypes
  /**
   * TodoCountOutputType without action
   */
  export type TodoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TodoCountOutputType
     */
    select?: TodoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TodoCountOutputType without action
   */
  export type TodoCountOutputTypeCountChildrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TodoWhereInput
  }

  /**
   * TodoCountOutputType without action
   */
  export type TodoCountOutputTypeCountPinnedInArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PinnedTodoWhereInput
  }

  /**
   * TodoCountOutputType without action
   */
  export type TodoCountOutputTypeCountTagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TagWhereInput
  }


  /**
   * Count Type PinnedListCountOutputType
   */

  export type PinnedListCountOutputType = {
    todos: number
  }

  export type PinnedListCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    todos?: boolean | PinnedListCountOutputTypeCountTodosArgs
  }

  // Custom InputTypes
  /**
   * PinnedListCountOutputType without action
   */
  export type PinnedListCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedListCountOutputType
     */
    select?: PinnedListCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PinnedListCountOutputType without action
   */
  export type PinnedListCountOutputTypeCountTodosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PinnedTodoWhereInput
  }


  /**
   * Count Type TagCountOutputType
   */

  export type TagCountOutputType = {
    todos: number
  }

  export type TagCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    todos?: boolean | TagCountOutputTypeCountTodosArgs
  }

  // Custom InputTypes
  /**
   * TagCountOutputType without action
   */
  export type TagCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TagCountOutputType
     */
    select?: TagCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TagCountOutputType without action
   */
  export type TagCountOutputTypeCountTodosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TodoWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Todo
   */

  export type AggregateTodo = {
    _count: TodoCountAggregateOutputType | null
    _avg: TodoAvgAggregateOutputType | null
    _sum: TodoSumAggregateOutputType | null
    _min: TodoMinAggregateOutputType | null
    _max: TodoMaxAggregateOutputType | null
  }

  export type TodoAvgAggregateOutputType = {
    position: number | null
  }

  export type TodoSumAggregateOutputType = {
    position: number | null
  }

  export type TodoMinAggregateOutputType = {
    id: string | null
    title: string | null
    completed: boolean | null
    completedAt: Date | null
    pinned: boolean | null
    position: number | null
    parentId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TodoMaxAggregateOutputType = {
    id: string | null
    title: string | null
    completed: boolean | null
    completedAt: Date | null
    pinned: boolean | null
    position: number | null
    parentId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TodoCountAggregateOutputType = {
    id: number
    title: number
    completed: number
    completedAt: number
    pinned: number
    position: number
    parentId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TodoAvgAggregateInputType = {
    position?: true
  }

  export type TodoSumAggregateInputType = {
    position?: true
  }

  export type TodoMinAggregateInputType = {
    id?: true
    title?: true
    completed?: true
    completedAt?: true
    pinned?: true
    position?: true
    parentId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TodoMaxAggregateInputType = {
    id?: true
    title?: true
    completed?: true
    completedAt?: true
    pinned?: true
    position?: true
    parentId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TodoCountAggregateInputType = {
    id?: true
    title?: true
    completed?: true
    completedAt?: true
    pinned?: true
    position?: true
    parentId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TodoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Todo to aggregate.
     */
    where?: TodoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Todos to fetch.
     */
    orderBy?: TodoOrderByWithRelationInput | TodoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TodoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Todos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Todos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Todos
    **/
    _count?: true | TodoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TodoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TodoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TodoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TodoMaxAggregateInputType
  }

  export type GetTodoAggregateType<T extends TodoAggregateArgs> = {
        [P in keyof T & keyof AggregateTodo]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTodo[P]>
      : GetScalarType<T[P], AggregateTodo[P]>
  }




  export type TodoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TodoWhereInput
    orderBy?: TodoOrderByWithAggregationInput | TodoOrderByWithAggregationInput[]
    by: TodoScalarFieldEnum[] | TodoScalarFieldEnum
    having?: TodoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TodoCountAggregateInputType | true
    _avg?: TodoAvgAggregateInputType
    _sum?: TodoSumAggregateInputType
    _min?: TodoMinAggregateInputType
    _max?: TodoMaxAggregateInputType
  }

  export type TodoGroupByOutputType = {
    id: string
    title: string
    completed: boolean
    completedAt: Date | null
    pinned: boolean
    position: number
    parentId: string | null
    createdAt: Date
    updatedAt: Date
    _count: TodoCountAggregateOutputType | null
    _avg: TodoAvgAggregateOutputType | null
    _sum: TodoSumAggregateOutputType | null
    _min: TodoMinAggregateOutputType | null
    _max: TodoMaxAggregateOutputType | null
  }

  type GetTodoGroupByPayload<T extends TodoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TodoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TodoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TodoGroupByOutputType[P]>
            : GetScalarType<T[P], TodoGroupByOutputType[P]>
        }
      >
    >


  export type TodoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    completed?: boolean
    completedAt?: boolean
    pinned?: boolean
    position?: boolean
    parentId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    parent?: boolean | Todo$parentArgs<ExtArgs>
    children?: boolean | Todo$childrenArgs<ExtArgs>
    pinnedIn?: boolean | Todo$pinnedInArgs<ExtArgs>
    tags?: boolean | Todo$tagsArgs<ExtArgs>
    _count?: boolean | TodoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["todo"]>

  export type TodoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    completed?: boolean
    completedAt?: boolean
    pinned?: boolean
    position?: boolean
    parentId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    parent?: boolean | Todo$parentArgs<ExtArgs>
  }, ExtArgs["result"]["todo"]>

  export type TodoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    completed?: boolean
    completedAt?: boolean
    pinned?: boolean
    position?: boolean
    parentId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    parent?: boolean | Todo$parentArgs<ExtArgs>
  }, ExtArgs["result"]["todo"]>

  export type TodoSelectScalar = {
    id?: boolean
    title?: boolean
    completed?: boolean
    completedAt?: boolean
    pinned?: boolean
    position?: boolean
    parentId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TodoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "completed" | "completedAt" | "pinned" | "position" | "parentId" | "createdAt" | "updatedAt", ExtArgs["result"]["todo"]>
  export type TodoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | Todo$parentArgs<ExtArgs>
    children?: boolean | Todo$childrenArgs<ExtArgs>
    pinnedIn?: boolean | Todo$pinnedInArgs<ExtArgs>
    tags?: boolean | Todo$tagsArgs<ExtArgs>
    _count?: boolean | TodoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TodoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | Todo$parentArgs<ExtArgs>
  }
  export type TodoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | Todo$parentArgs<ExtArgs>
  }

  export type $TodoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Todo"
    objects: {
      parent: Prisma.$TodoPayload<ExtArgs> | null
      children: Prisma.$TodoPayload<ExtArgs>[]
      pinnedIn: Prisma.$PinnedTodoPayload<ExtArgs>[]
      tags: Prisma.$TagPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      completed: boolean
      completedAt: Date | null
      pinned: boolean
      position: number
      parentId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["todo"]>
    composites: {}
  }

  type TodoGetPayload<S extends boolean | null | undefined | TodoDefaultArgs> = $Result.GetResult<Prisma.$TodoPayload, S>

  type TodoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TodoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TodoCountAggregateInputType | true
    }

  export interface TodoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Todo'], meta: { name: 'Todo' } }
    /**
     * Find zero or one Todo that matches the filter.
     * @param {TodoFindUniqueArgs} args - Arguments to find a Todo
     * @example
     * // Get one Todo
     * const todo = await prisma.todo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TodoFindUniqueArgs>(args: SelectSubset<T, TodoFindUniqueArgs<ExtArgs>>): Prisma__TodoClient<$Result.GetResult<Prisma.$TodoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Todo that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TodoFindUniqueOrThrowArgs} args - Arguments to find a Todo
     * @example
     * // Get one Todo
     * const todo = await prisma.todo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TodoFindUniqueOrThrowArgs>(args: SelectSubset<T, TodoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TodoClient<$Result.GetResult<Prisma.$TodoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Todo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TodoFindFirstArgs} args - Arguments to find a Todo
     * @example
     * // Get one Todo
     * const todo = await prisma.todo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TodoFindFirstArgs>(args?: SelectSubset<T, TodoFindFirstArgs<ExtArgs>>): Prisma__TodoClient<$Result.GetResult<Prisma.$TodoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Todo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TodoFindFirstOrThrowArgs} args - Arguments to find a Todo
     * @example
     * // Get one Todo
     * const todo = await prisma.todo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TodoFindFirstOrThrowArgs>(args?: SelectSubset<T, TodoFindFirstOrThrowArgs<ExtArgs>>): Prisma__TodoClient<$Result.GetResult<Prisma.$TodoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Todos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TodoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Todos
     * const todos = await prisma.todo.findMany()
     * 
     * // Get first 10 Todos
     * const todos = await prisma.todo.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const todoWithIdOnly = await prisma.todo.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TodoFindManyArgs>(args?: SelectSubset<T, TodoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TodoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Todo.
     * @param {TodoCreateArgs} args - Arguments to create a Todo.
     * @example
     * // Create one Todo
     * const Todo = await prisma.todo.create({
     *   data: {
     *     // ... data to create a Todo
     *   }
     * })
     * 
     */
    create<T extends TodoCreateArgs>(args: SelectSubset<T, TodoCreateArgs<ExtArgs>>): Prisma__TodoClient<$Result.GetResult<Prisma.$TodoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Todos.
     * @param {TodoCreateManyArgs} args - Arguments to create many Todos.
     * @example
     * // Create many Todos
     * const todo = await prisma.todo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TodoCreateManyArgs>(args?: SelectSubset<T, TodoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Todos and returns the data saved in the database.
     * @param {TodoCreateManyAndReturnArgs} args - Arguments to create many Todos.
     * @example
     * // Create many Todos
     * const todo = await prisma.todo.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Todos and only return the `id`
     * const todoWithIdOnly = await prisma.todo.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TodoCreateManyAndReturnArgs>(args?: SelectSubset<T, TodoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TodoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Todo.
     * @param {TodoDeleteArgs} args - Arguments to delete one Todo.
     * @example
     * // Delete one Todo
     * const Todo = await prisma.todo.delete({
     *   where: {
     *     // ... filter to delete one Todo
     *   }
     * })
     * 
     */
    delete<T extends TodoDeleteArgs>(args: SelectSubset<T, TodoDeleteArgs<ExtArgs>>): Prisma__TodoClient<$Result.GetResult<Prisma.$TodoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Todo.
     * @param {TodoUpdateArgs} args - Arguments to update one Todo.
     * @example
     * // Update one Todo
     * const todo = await prisma.todo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TodoUpdateArgs>(args: SelectSubset<T, TodoUpdateArgs<ExtArgs>>): Prisma__TodoClient<$Result.GetResult<Prisma.$TodoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Todos.
     * @param {TodoDeleteManyArgs} args - Arguments to filter Todos to delete.
     * @example
     * // Delete a few Todos
     * const { count } = await prisma.todo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TodoDeleteManyArgs>(args?: SelectSubset<T, TodoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Todos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TodoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Todos
     * const todo = await prisma.todo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TodoUpdateManyArgs>(args: SelectSubset<T, TodoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Todos and returns the data updated in the database.
     * @param {TodoUpdateManyAndReturnArgs} args - Arguments to update many Todos.
     * @example
     * // Update many Todos
     * const todo = await prisma.todo.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Todos and only return the `id`
     * const todoWithIdOnly = await prisma.todo.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TodoUpdateManyAndReturnArgs>(args: SelectSubset<T, TodoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TodoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Todo.
     * @param {TodoUpsertArgs} args - Arguments to update or create a Todo.
     * @example
     * // Update or create a Todo
     * const todo = await prisma.todo.upsert({
     *   create: {
     *     // ... data to create a Todo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Todo we want to update
     *   }
     * })
     */
    upsert<T extends TodoUpsertArgs>(args: SelectSubset<T, TodoUpsertArgs<ExtArgs>>): Prisma__TodoClient<$Result.GetResult<Prisma.$TodoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Todos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TodoCountArgs} args - Arguments to filter Todos to count.
     * @example
     * // Count the number of Todos
     * const count = await prisma.todo.count({
     *   where: {
     *     // ... the filter for the Todos we want to count
     *   }
     * })
    **/
    count<T extends TodoCountArgs>(
      args?: Subset<T, TodoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TodoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Todo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TodoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TodoAggregateArgs>(args: Subset<T, TodoAggregateArgs>): Prisma.PrismaPromise<GetTodoAggregateType<T>>

    /**
     * Group by Todo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TodoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TodoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TodoGroupByArgs['orderBy'] }
        : { orderBy?: TodoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TodoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTodoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Todo model
   */
  readonly fields: TodoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Todo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TodoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    parent<T extends Todo$parentArgs<ExtArgs> = {}>(args?: Subset<T, Todo$parentArgs<ExtArgs>>): Prisma__TodoClient<$Result.GetResult<Prisma.$TodoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    children<T extends Todo$childrenArgs<ExtArgs> = {}>(args?: Subset<T, Todo$childrenArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TodoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    pinnedIn<T extends Todo$pinnedInArgs<ExtArgs> = {}>(args?: Subset<T, Todo$pinnedInArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PinnedTodoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    tags<T extends Todo$tagsArgs<ExtArgs> = {}>(args?: Subset<T, Todo$tagsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Todo model
   */
  interface TodoFieldRefs {
    readonly id: FieldRef<"Todo", 'String'>
    readonly title: FieldRef<"Todo", 'String'>
    readonly completed: FieldRef<"Todo", 'Boolean'>
    readonly completedAt: FieldRef<"Todo", 'DateTime'>
    readonly pinned: FieldRef<"Todo", 'Boolean'>
    readonly position: FieldRef<"Todo", 'Int'>
    readonly parentId: FieldRef<"Todo", 'String'>
    readonly createdAt: FieldRef<"Todo", 'DateTime'>
    readonly updatedAt: FieldRef<"Todo", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Todo findUnique
   */
  export type TodoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Todo
     */
    select?: TodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Todo
     */
    omit?: TodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TodoInclude<ExtArgs> | null
    /**
     * Filter, which Todo to fetch.
     */
    where: TodoWhereUniqueInput
  }

  /**
   * Todo findUniqueOrThrow
   */
  export type TodoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Todo
     */
    select?: TodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Todo
     */
    omit?: TodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TodoInclude<ExtArgs> | null
    /**
     * Filter, which Todo to fetch.
     */
    where: TodoWhereUniqueInput
  }

  /**
   * Todo findFirst
   */
  export type TodoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Todo
     */
    select?: TodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Todo
     */
    omit?: TodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TodoInclude<ExtArgs> | null
    /**
     * Filter, which Todo to fetch.
     */
    where?: TodoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Todos to fetch.
     */
    orderBy?: TodoOrderByWithRelationInput | TodoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Todos.
     */
    cursor?: TodoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Todos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Todos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Todos.
     */
    distinct?: TodoScalarFieldEnum | TodoScalarFieldEnum[]
  }

  /**
   * Todo findFirstOrThrow
   */
  export type TodoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Todo
     */
    select?: TodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Todo
     */
    omit?: TodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TodoInclude<ExtArgs> | null
    /**
     * Filter, which Todo to fetch.
     */
    where?: TodoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Todos to fetch.
     */
    orderBy?: TodoOrderByWithRelationInput | TodoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Todos.
     */
    cursor?: TodoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Todos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Todos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Todos.
     */
    distinct?: TodoScalarFieldEnum | TodoScalarFieldEnum[]
  }

  /**
   * Todo findMany
   */
  export type TodoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Todo
     */
    select?: TodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Todo
     */
    omit?: TodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TodoInclude<ExtArgs> | null
    /**
     * Filter, which Todos to fetch.
     */
    where?: TodoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Todos to fetch.
     */
    orderBy?: TodoOrderByWithRelationInput | TodoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Todos.
     */
    cursor?: TodoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Todos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Todos.
     */
    skip?: number
    distinct?: TodoScalarFieldEnum | TodoScalarFieldEnum[]
  }

  /**
   * Todo create
   */
  export type TodoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Todo
     */
    select?: TodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Todo
     */
    omit?: TodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TodoInclude<ExtArgs> | null
    /**
     * The data needed to create a Todo.
     */
    data: XOR<TodoCreateInput, TodoUncheckedCreateInput>
  }

  /**
   * Todo createMany
   */
  export type TodoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Todos.
     */
    data: TodoCreateManyInput | TodoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Todo createManyAndReturn
   */
  export type TodoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Todo
     */
    select?: TodoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Todo
     */
    omit?: TodoOmit<ExtArgs> | null
    /**
     * The data used to create many Todos.
     */
    data: TodoCreateManyInput | TodoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TodoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Todo update
   */
  export type TodoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Todo
     */
    select?: TodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Todo
     */
    omit?: TodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TodoInclude<ExtArgs> | null
    /**
     * The data needed to update a Todo.
     */
    data: XOR<TodoUpdateInput, TodoUncheckedUpdateInput>
    /**
     * Choose, which Todo to update.
     */
    where: TodoWhereUniqueInput
  }

  /**
   * Todo updateMany
   */
  export type TodoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Todos.
     */
    data: XOR<TodoUpdateManyMutationInput, TodoUncheckedUpdateManyInput>
    /**
     * Filter which Todos to update
     */
    where?: TodoWhereInput
    /**
     * Limit how many Todos to update.
     */
    limit?: number
  }

  /**
   * Todo updateManyAndReturn
   */
  export type TodoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Todo
     */
    select?: TodoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Todo
     */
    omit?: TodoOmit<ExtArgs> | null
    /**
     * The data used to update Todos.
     */
    data: XOR<TodoUpdateManyMutationInput, TodoUncheckedUpdateManyInput>
    /**
     * Filter which Todos to update
     */
    where?: TodoWhereInput
    /**
     * Limit how many Todos to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TodoIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Todo upsert
   */
  export type TodoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Todo
     */
    select?: TodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Todo
     */
    omit?: TodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TodoInclude<ExtArgs> | null
    /**
     * The filter to search for the Todo to update in case it exists.
     */
    where: TodoWhereUniqueInput
    /**
     * In case the Todo found by the `where` argument doesn't exist, create a new Todo with this data.
     */
    create: XOR<TodoCreateInput, TodoUncheckedCreateInput>
    /**
     * In case the Todo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TodoUpdateInput, TodoUncheckedUpdateInput>
  }

  /**
   * Todo delete
   */
  export type TodoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Todo
     */
    select?: TodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Todo
     */
    omit?: TodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TodoInclude<ExtArgs> | null
    /**
     * Filter which Todo to delete.
     */
    where: TodoWhereUniqueInput
  }

  /**
   * Todo deleteMany
   */
  export type TodoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Todos to delete
     */
    where?: TodoWhereInput
    /**
     * Limit how many Todos to delete.
     */
    limit?: number
  }

  /**
   * Todo.parent
   */
  export type Todo$parentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Todo
     */
    select?: TodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Todo
     */
    omit?: TodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TodoInclude<ExtArgs> | null
    where?: TodoWhereInput
  }

  /**
   * Todo.children
   */
  export type Todo$childrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Todo
     */
    select?: TodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Todo
     */
    omit?: TodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TodoInclude<ExtArgs> | null
    where?: TodoWhereInput
    orderBy?: TodoOrderByWithRelationInput | TodoOrderByWithRelationInput[]
    cursor?: TodoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TodoScalarFieldEnum | TodoScalarFieldEnum[]
  }

  /**
   * Todo.pinnedIn
   */
  export type Todo$pinnedInArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedTodo
     */
    select?: PinnedTodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedTodo
     */
    omit?: PinnedTodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedTodoInclude<ExtArgs> | null
    where?: PinnedTodoWhereInput
    orderBy?: PinnedTodoOrderByWithRelationInput | PinnedTodoOrderByWithRelationInput[]
    cursor?: PinnedTodoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PinnedTodoScalarFieldEnum | PinnedTodoScalarFieldEnum[]
  }

  /**
   * Todo.tags
   */
  export type Todo$tagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    where?: TagWhereInput
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    cursor?: TagWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Todo without action
   */
  export type TodoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Todo
     */
    select?: TodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Todo
     */
    omit?: TodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TodoInclude<ExtArgs> | null
  }


  /**
   * Model PinnedList
   */

  export type AggregatePinnedList = {
    _count: PinnedListCountAggregateOutputType | null
    _avg: PinnedListAvgAggregateOutputType | null
    _sum: PinnedListSumAggregateOutputType | null
    _min: PinnedListMinAggregateOutputType | null
    _max: PinnedListMaxAggregateOutputType | null
  }

  export type PinnedListAvgAggregateOutputType = {
    position: number | null
  }

  export type PinnedListSumAggregateOutputType = {
    position: number | null
  }

  export type PinnedListMinAggregateOutputType = {
    id: string | null
    title: string | null
    position: number | null
    isPrimary: boolean | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PinnedListMaxAggregateOutputType = {
    id: string | null
    title: string | null
    position: number | null
    isPrimary: boolean | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PinnedListCountAggregateOutputType = {
    id: number
    title: number
    position: number
    isPrimary: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PinnedListAvgAggregateInputType = {
    position?: true
  }

  export type PinnedListSumAggregateInputType = {
    position?: true
  }

  export type PinnedListMinAggregateInputType = {
    id?: true
    title?: true
    position?: true
    isPrimary?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PinnedListMaxAggregateInputType = {
    id?: true
    title?: true
    position?: true
    isPrimary?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PinnedListCountAggregateInputType = {
    id?: true
    title?: true
    position?: true
    isPrimary?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PinnedListAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PinnedList to aggregate.
     */
    where?: PinnedListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PinnedLists to fetch.
     */
    orderBy?: PinnedListOrderByWithRelationInput | PinnedListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PinnedListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PinnedLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PinnedLists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PinnedLists
    **/
    _count?: true | PinnedListCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PinnedListAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PinnedListSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PinnedListMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PinnedListMaxAggregateInputType
  }

  export type GetPinnedListAggregateType<T extends PinnedListAggregateArgs> = {
        [P in keyof T & keyof AggregatePinnedList]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePinnedList[P]>
      : GetScalarType<T[P], AggregatePinnedList[P]>
  }




  export type PinnedListGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PinnedListWhereInput
    orderBy?: PinnedListOrderByWithAggregationInput | PinnedListOrderByWithAggregationInput[]
    by: PinnedListScalarFieldEnum[] | PinnedListScalarFieldEnum
    having?: PinnedListScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PinnedListCountAggregateInputType | true
    _avg?: PinnedListAvgAggregateInputType
    _sum?: PinnedListSumAggregateInputType
    _min?: PinnedListMinAggregateInputType
    _max?: PinnedListMaxAggregateInputType
  }

  export type PinnedListGroupByOutputType = {
    id: string
    title: string
    position: number
    isPrimary: boolean
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: PinnedListCountAggregateOutputType | null
    _avg: PinnedListAvgAggregateOutputType | null
    _sum: PinnedListSumAggregateOutputType | null
    _min: PinnedListMinAggregateOutputType | null
    _max: PinnedListMaxAggregateOutputType | null
  }

  type GetPinnedListGroupByPayload<T extends PinnedListGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PinnedListGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PinnedListGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PinnedListGroupByOutputType[P]>
            : GetScalarType<T[P], PinnedListGroupByOutputType[P]>
        }
      >
    >


  export type PinnedListSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    position?: boolean
    isPrimary?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    todos?: boolean | PinnedList$todosArgs<ExtArgs>
    _count?: boolean | PinnedListCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pinnedList"]>

  export type PinnedListSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    position?: boolean
    isPrimary?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["pinnedList"]>

  export type PinnedListSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    position?: boolean
    isPrimary?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["pinnedList"]>

  export type PinnedListSelectScalar = {
    id?: boolean
    title?: boolean
    position?: boolean
    isPrimary?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PinnedListOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "position" | "isPrimary" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["pinnedList"]>
  export type PinnedListInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    todos?: boolean | PinnedList$todosArgs<ExtArgs>
    _count?: boolean | PinnedListCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PinnedListIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type PinnedListIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PinnedListPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PinnedList"
    objects: {
      todos: Prisma.$PinnedTodoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      position: number
      isPrimary: boolean
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["pinnedList"]>
    composites: {}
  }

  type PinnedListGetPayload<S extends boolean | null | undefined | PinnedListDefaultArgs> = $Result.GetResult<Prisma.$PinnedListPayload, S>

  type PinnedListCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PinnedListFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PinnedListCountAggregateInputType | true
    }

  export interface PinnedListDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PinnedList'], meta: { name: 'PinnedList' } }
    /**
     * Find zero or one PinnedList that matches the filter.
     * @param {PinnedListFindUniqueArgs} args - Arguments to find a PinnedList
     * @example
     * // Get one PinnedList
     * const pinnedList = await prisma.pinnedList.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PinnedListFindUniqueArgs>(args: SelectSubset<T, PinnedListFindUniqueArgs<ExtArgs>>): Prisma__PinnedListClient<$Result.GetResult<Prisma.$PinnedListPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PinnedList that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PinnedListFindUniqueOrThrowArgs} args - Arguments to find a PinnedList
     * @example
     * // Get one PinnedList
     * const pinnedList = await prisma.pinnedList.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PinnedListFindUniqueOrThrowArgs>(args: SelectSubset<T, PinnedListFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PinnedListClient<$Result.GetResult<Prisma.$PinnedListPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PinnedList that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PinnedListFindFirstArgs} args - Arguments to find a PinnedList
     * @example
     * // Get one PinnedList
     * const pinnedList = await prisma.pinnedList.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PinnedListFindFirstArgs>(args?: SelectSubset<T, PinnedListFindFirstArgs<ExtArgs>>): Prisma__PinnedListClient<$Result.GetResult<Prisma.$PinnedListPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PinnedList that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PinnedListFindFirstOrThrowArgs} args - Arguments to find a PinnedList
     * @example
     * // Get one PinnedList
     * const pinnedList = await prisma.pinnedList.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PinnedListFindFirstOrThrowArgs>(args?: SelectSubset<T, PinnedListFindFirstOrThrowArgs<ExtArgs>>): Prisma__PinnedListClient<$Result.GetResult<Prisma.$PinnedListPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PinnedLists that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PinnedListFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PinnedLists
     * const pinnedLists = await prisma.pinnedList.findMany()
     * 
     * // Get first 10 PinnedLists
     * const pinnedLists = await prisma.pinnedList.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pinnedListWithIdOnly = await prisma.pinnedList.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PinnedListFindManyArgs>(args?: SelectSubset<T, PinnedListFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PinnedListPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PinnedList.
     * @param {PinnedListCreateArgs} args - Arguments to create a PinnedList.
     * @example
     * // Create one PinnedList
     * const PinnedList = await prisma.pinnedList.create({
     *   data: {
     *     // ... data to create a PinnedList
     *   }
     * })
     * 
     */
    create<T extends PinnedListCreateArgs>(args: SelectSubset<T, PinnedListCreateArgs<ExtArgs>>): Prisma__PinnedListClient<$Result.GetResult<Prisma.$PinnedListPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PinnedLists.
     * @param {PinnedListCreateManyArgs} args - Arguments to create many PinnedLists.
     * @example
     * // Create many PinnedLists
     * const pinnedList = await prisma.pinnedList.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PinnedListCreateManyArgs>(args?: SelectSubset<T, PinnedListCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PinnedLists and returns the data saved in the database.
     * @param {PinnedListCreateManyAndReturnArgs} args - Arguments to create many PinnedLists.
     * @example
     * // Create many PinnedLists
     * const pinnedList = await prisma.pinnedList.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PinnedLists and only return the `id`
     * const pinnedListWithIdOnly = await prisma.pinnedList.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PinnedListCreateManyAndReturnArgs>(args?: SelectSubset<T, PinnedListCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PinnedListPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PinnedList.
     * @param {PinnedListDeleteArgs} args - Arguments to delete one PinnedList.
     * @example
     * // Delete one PinnedList
     * const PinnedList = await prisma.pinnedList.delete({
     *   where: {
     *     // ... filter to delete one PinnedList
     *   }
     * })
     * 
     */
    delete<T extends PinnedListDeleteArgs>(args: SelectSubset<T, PinnedListDeleteArgs<ExtArgs>>): Prisma__PinnedListClient<$Result.GetResult<Prisma.$PinnedListPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PinnedList.
     * @param {PinnedListUpdateArgs} args - Arguments to update one PinnedList.
     * @example
     * // Update one PinnedList
     * const pinnedList = await prisma.pinnedList.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PinnedListUpdateArgs>(args: SelectSubset<T, PinnedListUpdateArgs<ExtArgs>>): Prisma__PinnedListClient<$Result.GetResult<Prisma.$PinnedListPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PinnedLists.
     * @param {PinnedListDeleteManyArgs} args - Arguments to filter PinnedLists to delete.
     * @example
     * // Delete a few PinnedLists
     * const { count } = await prisma.pinnedList.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PinnedListDeleteManyArgs>(args?: SelectSubset<T, PinnedListDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PinnedLists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PinnedListUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PinnedLists
     * const pinnedList = await prisma.pinnedList.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PinnedListUpdateManyArgs>(args: SelectSubset<T, PinnedListUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PinnedLists and returns the data updated in the database.
     * @param {PinnedListUpdateManyAndReturnArgs} args - Arguments to update many PinnedLists.
     * @example
     * // Update many PinnedLists
     * const pinnedList = await prisma.pinnedList.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PinnedLists and only return the `id`
     * const pinnedListWithIdOnly = await prisma.pinnedList.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PinnedListUpdateManyAndReturnArgs>(args: SelectSubset<T, PinnedListUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PinnedListPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PinnedList.
     * @param {PinnedListUpsertArgs} args - Arguments to update or create a PinnedList.
     * @example
     * // Update or create a PinnedList
     * const pinnedList = await prisma.pinnedList.upsert({
     *   create: {
     *     // ... data to create a PinnedList
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PinnedList we want to update
     *   }
     * })
     */
    upsert<T extends PinnedListUpsertArgs>(args: SelectSubset<T, PinnedListUpsertArgs<ExtArgs>>): Prisma__PinnedListClient<$Result.GetResult<Prisma.$PinnedListPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PinnedLists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PinnedListCountArgs} args - Arguments to filter PinnedLists to count.
     * @example
     * // Count the number of PinnedLists
     * const count = await prisma.pinnedList.count({
     *   where: {
     *     // ... the filter for the PinnedLists we want to count
     *   }
     * })
    **/
    count<T extends PinnedListCountArgs>(
      args?: Subset<T, PinnedListCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PinnedListCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PinnedList.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PinnedListAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PinnedListAggregateArgs>(args: Subset<T, PinnedListAggregateArgs>): Prisma.PrismaPromise<GetPinnedListAggregateType<T>>

    /**
     * Group by PinnedList.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PinnedListGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PinnedListGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PinnedListGroupByArgs['orderBy'] }
        : { orderBy?: PinnedListGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PinnedListGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPinnedListGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PinnedList model
   */
  readonly fields: PinnedListFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PinnedList.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PinnedListClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    todos<T extends PinnedList$todosArgs<ExtArgs> = {}>(args?: Subset<T, PinnedList$todosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PinnedTodoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PinnedList model
   */
  interface PinnedListFieldRefs {
    readonly id: FieldRef<"PinnedList", 'String'>
    readonly title: FieldRef<"PinnedList", 'String'>
    readonly position: FieldRef<"PinnedList", 'Int'>
    readonly isPrimary: FieldRef<"PinnedList", 'Boolean'>
    readonly isActive: FieldRef<"PinnedList", 'Boolean'>
    readonly createdAt: FieldRef<"PinnedList", 'DateTime'>
    readonly updatedAt: FieldRef<"PinnedList", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PinnedList findUnique
   */
  export type PinnedListFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedList
     */
    select?: PinnedListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedList
     */
    omit?: PinnedListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedListInclude<ExtArgs> | null
    /**
     * Filter, which PinnedList to fetch.
     */
    where: PinnedListWhereUniqueInput
  }

  /**
   * PinnedList findUniqueOrThrow
   */
  export type PinnedListFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedList
     */
    select?: PinnedListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedList
     */
    omit?: PinnedListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedListInclude<ExtArgs> | null
    /**
     * Filter, which PinnedList to fetch.
     */
    where: PinnedListWhereUniqueInput
  }

  /**
   * PinnedList findFirst
   */
  export type PinnedListFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedList
     */
    select?: PinnedListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedList
     */
    omit?: PinnedListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedListInclude<ExtArgs> | null
    /**
     * Filter, which PinnedList to fetch.
     */
    where?: PinnedListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PinnedLists to fetch.
     */
    orderBy?: PinnedListOrderByWithRelationInput | PinnedListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PinnedLists.
     */
    cursor?: PinnedListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PinnedLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PinnedLists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PinnedLists.
     */
    distinct?: PinnedListScalarFieldEnum | PinnedListScalarFieldEnum[]
  }

  /**
   * PinnedList findFirstOrThrow
   */
  export type PinnedListFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedList
     */
    select?: PinnedListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedList
     */
    omit?: PinnedListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedListInclude<ExtArgs> | null
    /**
     * Filter, which PinnedList to fetch.
     */
    where?: PinnedListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PinnedLists to fetch.
     */
    orderBy?: PinnedListOrderByWithRelationInput | PinnedListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PinnedLists.
     */
    cursor?: PinnedListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PinnedLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PinnedLists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PinnedLists.
     */
    distinct?: PinnedListScalarFieldEnum | PinnedListScalarFieldEnum[]
  }

  /**
   * PinnedList findMany
   */
  export type PinnedListFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedList
     */
    select?: PinnedListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedList
     */
    omit?: PinnedListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedListInclude<ExtArgs> | null
    /**
     * Filter, which PinnedLists to fetch.
     */
    where?: PinnedListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PinnedLists to fetch.
     */
    orderBy?: PinnedListOrderByWithRelationInput | PinnedListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PinnedLists.
     */
    cursor?: PinnedListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PinnedLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PinnedLists.
     */
    skip?: number
    distinct?: PinnedListScalarFieldEnum | PinnedListScalarFieldEnum[]
  }

  /**
   * PinnedList create
   */
  export type PinnedListCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedList
     */
    select?: PinnedListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedList
     */
    omit?: PinnedListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedListInclude<ExtArgs> | null
    /**
     * The data needed to create a PinnedList.
     */
    data: XOR<PinnedListCreateInput, PinnedListUncheckedCreateInput>
  }

  /**
   * PinnedList createMany
   */
  export type PinnedListCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PinnedLists.
     */
    data: PinnedListCreateManyInput | PinnedListCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PinnedList createManyAndReturn
   */
  export type PinnedListCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedList
     */
    select?: PinnedListSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedList
     */
    omit?: PinnedListOmit<ExtArgs> | null
    /**
     * The data used to create many PinnedLists.
     */
    data: PinnedListCreateManyInput | PinnedListCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PinnedList update
   */
  export type PinnedListUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedList
     */
    select?: PinnedListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedList
     */
    omit?: PinnedListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedListInclude<ExtArgs> | null
    /**
     * The data needed to update a PinnedList.
     */
    data: XOR<PinnedListUpdateInput, PinnedListUncheckedUpdateInput>
    /**
     * Choose, which PinnedList to update.
     */
    where: PinnedListWhereUniqueInput
  }

  /**
   * PinnedList updateMany
   */
  export type PinnedListUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PinnedLists.
     */
    data: XOR<PinnedListUpdateManyMutationInput, PinnedListUncheckedUpdateManyInput>
    /**
     * Filter which PinnedLists to update
     */
    where?: PinnedListWhereInput
    /**
     * Limit how many PinnedLists to update.
     */
    limit?: number
  }

  /**
   * PinnedList updateManyAndReturn
   */
  export type PinnedListUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedList
     */
    select?: PinnedListSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedList
     */
    omit?: PinnedListOmit<ExtArgs> | null
    /**
     * The data used to update PinnedLists.
     */
    data: XOR<PinnedListUpdateManyMutationInput, PinnedListUncheckedUpdateManyInput>
    /**
     * Filter which PinnedLists to update
     */
    where?: PinnedListWhereInput
    /**
     * Limit how many PinnedLists to update.
     */
    limit?: number
  }

  /**
   * PinnedList upsert
   */
  export type PinnedListUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedList
     */
    select?: PinnedListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedList
     */
    omit?: PinnedListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedListInclude<ExtArgs> | null
    /**
     * The filter to search for the PinnedList to update in case it exists.
     */
    where: PinnedListWhereUniqueInput
    /**
     * In case the PinnedList found by the `where` argument doesn't exist, create a new PinnedList with this data.
     */
    create: XOR<PinnedListCreateInput, PinnedListUncheckedCreateInput>
    /**
     * In case the PinnedList was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PinnedListUpdateInput, PinnedListUncheckedUpdateInput>
  }

  /**
   * PinnedList delete
   */
  export type PinnedListDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedList
     */
    select?: PinnedListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedList
     */
    omit?: PinnedListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedListInclude<ExtArgs> | null
    /**
     * Filter which PinnedList to delete.
     */
    where: PinnedListWhereUniqueInput
  }

  /**
   * PinnedList deleteMany
   */
  export type PinnedListDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PinnedLists to delete
     */
    where?: PinnedListWhereInput
    /**
     * Limit how many PinnedLists to delete.
     */
    limit?: number
  }

  /**
   * PinnedList.todos
   */
  export type PinnedList$todosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedTodo
     */
    select?: PinnedTodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedTodo
     */
    omit?: PinnedTodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedTodoInclude<ExtArgs> | null
    where?: PinnedTodoWhereInput
    orderBy?: PinnedTodoOrderByWithRelationInput | PinnedTodoOrderByWithRelationInput[]
    cursor?: PinnedTodoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PinnedTodoScalarFieldEnum | PinnedTodoScalarFieldEnum[]
  }

  /**
   * PinnedList without action
   */
  export type PinnedListDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedList
     */
    select?: PinnedListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedList
     */
    omit?: PinnedListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedListInclude<ExtArgs> | null
  }


  /**
   * Model PinnedTodo
   */

  export type AggregatePinnedTodo = {
    _count: PinnedTodoCountAggregateOutputType | null
    _avg: PinnedTodoAvgAggregateOutputType | null
    _sum: PinnedTodoSumAggregateOutputType | null
    _min: PinnedTodoMinAggregateOutputType | null
    _max: PinnedTodoMaxAggregateOutputType | null
  }

  export type PinnedTodoAvgAggregateOutputType = {
    id: number | null
    position: number | null
  }

  export type PinnedTodoSumAggregateOutputType = {
    id: number | null
    position: number | null
  }

  export type PinnedTodoMinAggregateOutputType = {
    id: number | null
    pinnedListId: string | null
    todoId: string | null
    position: number | null
  }

  export type PinnedTodoMaxAggregateOutputType = {
    id: number | null
    pinnedListId: string | null
    todoId: string | null
    position: number | null
  }

  export type PinnedTodoCountAggregateOutputType = {
    id: number
    pinnedListId: number
    todoId: number
    position: number
    _all: number
  }


  export type PinnedTodoAvgAggregateInputType = {
    id?: true
    position?: true
  }

  export type PinnedTodoSumAggregateInputType = {
    id?: true
    position?: true
  }

  export type PinnedTodoMinAggregateInputType = {
    id?: true
    pinnedListId?: true
    todoId?: true
    position?: true
  }

  export type PinnedTodoMaxAggregateInputType = {
    id?: true
    pinnedListId?: true
    todoId?: true
    position?: true
  }

  export type PinnedTodoCountAggregateInputType = {
    id?: true
    pinnedListId?: true
    todoId?: true
    position?: true
    _all?: true
  }

  export type PinnedTodoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PinnedTodo to aggregate.
     */
    where?: PinnedTodoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PinnedTodos to fetch.
     */
    orderBy?: PinnedTodoOrderByWithRelationInput | PinnedTodoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PinnedTodoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PinnedTodos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PinnedTodos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PinnedTodos
    **/
    _count?: true | PinnedTodoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PinnedTodoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PinnedTodoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PinnedTodoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PinnedTodoMaxAggregateInputType
  }

  export type GetPinnedTodoAggregateType<T extends PinnedTodoAggregateArgs> = {
        [P in keyof T & keyof AggregatePinnedTodo]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePinnedTodo[P]>
      : GetScalarType<T[P], AggregatePinnedTodo[P]>
  }




  export type PinnedTodoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PinnedTodoWhereInput
    orderBy?: PinnedTodoOrderByWithAggregationInput | PinnedTodoOrderByWithAggregationInput[]
    by: PinnedTodoScalarFieldEnum[] | PinnedTodoScalarFieldEnum
    having?: PinnedTodoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PinnedTodoCountAggregateInputType | true
    _avg?: PinnedTodoAvgAggregateInputType
    _sum?: PinnedTodoSumAggregateInputType
    _min?: PinnedTodoMinAggregateInputType
    _max?: PinnedTodoMaxAggregateInputType
  }

  export type PinnedTodoGroupByOutputType = {
    id: number
    pinnedListId: string
    todoId: string
    position: number
    _count: PinnedTodoCountAggregateOutputType | null
    _avg: PinnedTodoAvgAggregateOutputType | null
    _sum: PinnedTodoSumAggregateOutputType | null
    _min: PinnedTodoMinAggregateOutputType | null
    _max: PinnedTodoMaxAggregateOutputType | null
  }

  type GetPinnedTodoGroupByPayload<T extends PinnedTodoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PinnedTodoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PinnedTodoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PinnedTodoGroupByOutputType[P]>
            : GetScalarType<T[P], PinnedTodoGroupByOutputType[P]>
        }
      >
    >


  export type PinnedTodoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pinnedListId?: boolean
    todoId?: boolean
    position?: boolean
    pinnedList?: boolean | PinnedListDefaultArgs<ExtArgs>
    todo?: boolean | TodoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pinnedTodo"]>

  export type PinnedTodoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pinnedListId?: boolean
    todoId?: boolean
    position?: boolean
    pinnedList?: boolean | PinnedListDefaultArgs<ExtArgs>
    todo?: boolean | TodoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pinnedTodo"]>

  export type PinnedTodoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pinnedListId?: boolean
    todoId?: boolean
    position?: boolean
    pinnedList?: boolean | PinnedListDefaultArgs<ExtArgs>
    todo?: boolean | TodoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pinnedTodo"]>

  export type PinnedTodoSelectScalar = {
    id?: boolean
    pinnedListId?: boolean
    todoId?: boolean
    position?: boolean
  }

  export type PinnedTodoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "pinnedListId" | "todoId" | "position", ExtArgs["result"]["pinnedTodo"]>
  export type PinnedTodoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pinnedList?: boolean | PinnedListDefaultArgs<ExtArgs>
    todo?: boolean | TodoDefaultArgs<ExtArgs>
  }
  export type PinnedTodoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pinnedList?: boolean | PinnedListDefaultArgs<ExtArgs>
    todo?: boolean | TodoDefaultArgs<ExtArgs>
  }
  export type PinnedTodoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pinnedList?: boolean | PinnedListDefaultArgs<ExtArgs>
    todo?: boolean | TodoDefaultArgs<ExtArgs>
  }

  export type $PinnedTodoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PinnedTodo"
    objects: {
      pinnedList: Prisma.$PinnedListPayload<ExtArgs>
      todo: Prisma.$TodoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      pinnedListId: string
      todoId: string
      position: number
    }, ExtArgs["result"]["pinnedTodo"]>
    composites: {}
  }

  type PinnedTodoGetPayload<S extends boolean | null | undefined | PinnedTodoDefaultArgs> = $Result.GetResult<Prisma.$PinnedTodoPayload, S>

  type PinnedTodoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PinnedTodoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PinnedTodoCountAggregateInputType | true
    }

  export interface PinnedTodoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PinnedTodo'], meta: { name: 'PinnedTodo' } }
    /**
     * Find zero or one PinnedTodo that matches the filter.
     * @param {PinnedTodoFindUniqueArgs} args - Arguments to find a PinnedTodo
     * @example
     * // Get one PinnedTodo
     * const pinnedTodo = await prisma.pinnedTodo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PinnedTodoFindUniqueArgs>(args: SelectSubset<T, PinnedTodoFindUniqueArgs<ExtArgs>>): Prisma__PinnedTodoClient<$Result.GetResult<Prisma.$PinnedTodoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PinnedTodo that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PinnedTodoFindUniqueOrThrowArgs} args - Arguments to find a PinnedTodo
     * @example
     * // Get one PinnedTodo
     * const pinnedTodo = await prisma.pinnedTodo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PinnedTodoFindUniqueOrThrowArgs>(args: SelectSubset<T, PinnedTodoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PinnedTodoClient<$Result.GetResult<Prisma.$PinnedTodoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PinnedTodo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PinnedTodoFindFirstArgs} args - Arguments to find a PinnedTodo
     * @example
     * // Get one PinnedTodo
     * const pinnedTodo = await prisma.pinnedTodo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PinnedTodoFindFirstArgs>(args?: SelectSubset<T, PinnedTodoFindFirstArgs<ExtArgs>>): Prisma__PinnedTodoClient<$Result.GetResult<Prisma.$PinnedTodoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PinnedTodo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PinnedTodoFindFirstOrThrowArgs} args - Arguments to find a PinnedTodo
     * @example
     * // Get one PinnedTodo
     * const pinnedTodo = await prisma.pinnedTodo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PinnedTodoFindFirstOrThrowArgs>(args?: SelectSubset<T, PinnedTodoFindFirstOrThrowArgs<ExtArgs>>): Prisma__PinnedTodoClient<$Result.GetResult<Prisma.$PinnedTodoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PinnedTodos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PinnedTodoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PinnedTodos
     * const pinnedTodos = await prisma.pinnedTodo.findMany()
     * 
     * // Get first 10 PinnedTodos
     * const pinnedTodos = await prisma.pinnedTodo.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pinnedTodoWithIdOnly = await prisma.pinnedTodo.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PinnedTodoFindManyArgs>(args?: SelectSubset<T, PinnedTodoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PinnedTodoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PinnedTodo.
     * @param {PinnedTodoCreateArgs} args - Arguments to create a PinnedTodo.
     * @example
     * // Create one PinnedTodo
     * const PinnedTodo = await prisma.pinnedTodo.create({
     *   data: {
     *     // ... data to create a PinnedTodo
     *   }
     * })
     * 
     */
    create<T extends PinnedTodoCreateArgs>(args: SelectSubset<T, PinnedTodoCreateArgs<ExtArgs>>): Prisma__PinnedTodoClient<$Result.GetResult<Prisma.$PinnedTodoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PinnedTodos.
     * @param {PinnedTodoCreateManyArgs} args - Arguments to create many PinnedTodos.
     * @example
     * // Create many PinnedTodos
     * const pinnedTodo = await prisma.pinnedTodo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PinnedTodoCreateManyArgs>(args?: SelectSubset<T, PinnedTodoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PinnedTodos and returns the data saved in the database.
     * @param {PinnedTodoCreateManyAndReturnArgs} args - Arguments to create many PinnedTodos.
     * @example
     * // Create many PinnedTodos
     * const pinnedTodo = await prisma.pinnedTodo.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PinnedTodos and only return the `id`
     * const pinnedTodoWithIdOnly = await prisma.pinnedTodo.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PinnedTodoCreateManyAndReturnArgs>(args?: SelectSubset<T, PinnedTodoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PinnedTodoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PinnedTodo.
     * @param {PinnedTodoDeleteArgs} args - Arguments to delete one PinnedTodo.
     * @example
     * // Delete one PinnedTodo
     * const PinnedTodo = await prisma.pinnedTodo.delete({
     *   where: {
     *     // ... filter to delete one PinnedTodo
     *   }
     * })
     * 
     */
    delete<T extends PinnedTodoDeleteArgs>(args: SelectSubset<T, PinnedTodoDeleteArgs<ExtArgs>>): Prisma__PinnedTodoClient<$Result.GetResult<Prisma.$PinnedTodoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PinnedTodo.
     * @param {PinnedTodoUpdateArgs} args - Arguments to update one PinnedTodo.
     * @example
     * // Update one PinnedTodo
     * const pinnedTodo = await prisma.pinnedTodo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PinnedTodoUpdateArgs>(args: SelectSubset<T, PinnedTodoUpdateArgs<ExtArgs>>): Prisma__PinnedTodoClient<$Result.GetResult<Prisma.$PinnedTodoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PinnedTodos.
     * @param {PinnedTodoDeleteManyArgs} args - Arguments to filter PinnedTodos to delete.
     * @example
     * // Delete a few PinnedTodos
     * const { count } = await prisma.pinnedTodo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PinnedTodoDeleteManyArgs>(args?: SelectSubset<T, PinnedTodoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PinnedTodos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PinnedTodoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PinnedTodos
     * const pinnedTodo = await prisma.pinnedTodo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PinnedTodoUpdateManyArgs>(args: SelectSubset<T, PinnedTodoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PinnedTodos and returns the data updated in the database.
     * @param {PinnedTodoUpdateManyAndReturnArgs} args - Arguments to update many PinnedTodos.
     * @example
     * // Update many PinnedTodos
     * const pinnedTodo = await prisma.pinnedTodo.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PinnedTodos and only return the `id`
     * const pinnedTodoWithIdOnly = await prisma.pinnedTodo.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PinnedTodoUpdateManyAndReturnArgs>(args: SelectSubset<T, PinnedTodoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PinnedTodoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PinnedTodo.
     * @param {PinnedTodoUpsertArgs} args - Arguments to update or create a PinnedTodo.
     * @example
     * // Update or create a PinnedTodo
     * const pinnedTodo = await prisma.pinnedTodo.upsert({
     *   create: {
     *     // ... data to create a PinnedTodo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PinnedTodo we want to update
     *   }
     * })
     */
    upsert<T extends PinnedTodoUpsertArgs>(args: SelectSubset<T, PinnedTodoUpsertArgs<ExtArgs>>): Prisma__PinnedTodoClient<$Result.GetResult<Prisma.$PinnedTodoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PinnedTodos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PinnedTodoCountArgs} args - Arguments to filter PinnedTodos to count.
     * @example
     * // Count the number of PinnedTodos
     * const count = await prisma.pinnedTodo.count({
     *   where: {
     *     // ... the filter for the PinnedTodos we want to count
     *   }
     * })
    **/
    count<T extends PinnedTodoCountArgs>(
      args?: Subset<T, PinnedTodoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PinnedTodoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PinnedTodo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PinnedTodoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PinnedTodoAggregateArgs>(args: Subset<T, PinnedTodoAggregateArgs>): Prisma.PrismaPromise<GetPinnedTodoAggregateType<T>>

    /**
     * Group by PinnedTodo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PinnedTodoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PinnedTodoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PinnedTodoGroupByArgs['orderBy'] }
        : { orderBy?: PinnedTodoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PinnedTodoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPinnedTodoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PinnedTodo model
   */
  readonly fields: PinnedTodoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PinnedTodo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PinnedTodoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    pinnedList<T extends PinnedListDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PinnedListDefaultArgs<ExtArgs>>): Prisma__PinnedListClient<$Result.GetResult<Prisma.$PinnedListPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    todo<T extends TodoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TodoDefaultArgs<ExtArgs>>): Prisma__TodoClient<$Result.GetResult<Prisma.$TodoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PinnedTodo model
   */
  interface PinnedTodoFieldRefs {
    readonly id: FieldRef<"PinnedTodo", 'Int'>
    readonly pinnedListId: FieldRef<"PinnedTodo", 'String'>
    readonly todoId: FieldRef<"PinnedTodo", 'String'>
    readonly position: FieldRef<"PinnedTodo", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * PinnedTodo findUnique
   */
  export type PinnedTodoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedTodo
     */
    select?: PinnedTodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedTodo
     */
    omit?: PinnedTodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedTodoInclude<ExtArgs> | null
    /**
     * Filter, which PinnedTodo to fetch.
     */
    where: PinnedTodoWhereUniqueInput
  }

  /**
   * PinnedTodo findUniqueOrThrow
   */
  export type PinnedTodoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedTodo
     */
    select?: PinnedTodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedTodo
     */
    omit?: PinnedTodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedTodoInclude<ExtArgs> | null
    /**
     * Filter, which PinnedTodo to fetch.
     */
    where: PinnedTodoWhereUniqueInput
  }

  /**
   * PinnedTodo findFirst
   */
  export type PinnedTodoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedTodo
     */
    select?: PinnedTodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedTodo
     */
    omit?: PinnedTodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedTodoInclude<ExtArgs> | null
    /**
     * Filter, which PinnedTodo to fetch.
     */
    where?: PinnedTodoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PinnedTodos to fetch.
     */
    orderBy?: PinnedTodoOrderByWithRelationInput | PinnedTodoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PinnedTodos.
     */
    cursor?: PinnedTodoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PinnedTodos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PinnedTodos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PinnedTodos.
     */
    distinct?: PinnedTodoScalarFieldEnum | PinnedTodoScalarFieldEnum[]
  }

  /**
   * PinnedTodo findFirstOrThrow
   */
  export type PinnedTodoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedTodo
     */
    select?: PinnedTodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedTodo
     */
    omit?: PinnedTodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedTodoInclude<ExtArgs> | null
    /**
     * Filter, which PinnedTodo to fetch.
     */
    where?: PinnedTodoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PinnedTodos to fetch.
     */
    orderBy?: PinnedTodoOrderByWithRelationInput | PinnedTodoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PinnedTodos.
     */
    cursor?: PinnedTodoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PinnedTodos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PinnedTodos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PinnedTodos.
     */
    distinct?: PinnedTodoScalarFieldEnum | PinnedTodoScalarFieldEnum[]
  }

  /**
   * PinnedTodo findMany
   */
  export type PinnedTodoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedTodo
     */
    select?: PinnedTodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedTodo
     */
    omit?: PinnedTodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedTodoInclude<ExtArgs> | null
    /**
     * Filter, which PinnedTodos to fetch.
     */
    where?: PinnedTodoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PinnedTodos to fetch.
     */
    orderBy?: PinnedTodoOrderByWithRelationInput | PinnedTodoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PinnedTodos.
     */
    cursor?: PinnedTodoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PinnedTodos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PinnedTodos.
     */
    skip?: number
    distinct?: PinnedTodoScalarFieldEnum | PinnedTodoScalarFieldEnum[]
  }

  /**
   * PinnedTodo create
   */
  export type PinnedTodoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedTodo
     */
    select?: PinnedTodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedTodo
     */
    omit?: PinnedTodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedTodoInclude<ExtArgs> | null
    /**
     * The data needed to create a PinnedTodo.
     */
    data: XOR<PinnedTodoCreateInput, PinnedTodoUncheckedCreateInput>
  }

  /**
   * PinnedTodo createMany
   */
  export type PinnedTodoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PinnedTodos.
     */
    data: PinnedTodoCreateManyInput | PinnedTodoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PinnedTodo createManyAndReturn
   */
  export type PinnedTodoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedTodo
     */
    select?: PinnedTodoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedTodo
     */
    omit?: PinnedTodoOmit<ExtArgs> | null
    /**
     * The data used to create many PinnedTodos.
     */
    data: PinnedTodoCreateManyInput | PinnedTodoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedTodoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PinnedTodo update
   */
  export type PinnedTodoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedTodo
     */
    select?: PinnedTodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedTodo
     */
    omit?: PinnedTodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedTodoInclude<ExtArgs> | null
    /**
     * The data needed to update a PinnedTodo.
     */
    data: XOR<PinnedTodoUpdateInput, PinnedTodoUncheckedUpdateInput>
    /**
     * Choose, which PinnedTodo to update.
     */
    where: PinnedTodoWhereUniqueInput
  }

  /**
   * PinnedTodo updateMany
   */
  export type PinnedTodoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PinnedTodos.
     */
    data: XOR<PinnedTodoUpdateManyMutationInput, PinnedTodoUncheckedUpdateManyInput>
    /**
     * Filter which PinnedTodos to update
     */
    where?: PinnedTodoWhereInput
    /**
     * Limit how many PinnedTodos to update.
     */
    limit?: number
  }

  /**
   * PinnedTodo updateManyAndReturn
   */
  export type PinnedTodoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedTodo
     */
    select?: PinnedTodoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedTodo
     */
    omit?: PinnedTodoOmit<ExtArgs> | null
    /**
     * The data used to update PinnedTodos.
     */
    data: XOR<PinnedTodoUpdateManyMutationInput, PinnedTodoUncheckedUpdateManyInput>
    /**
     * Filter which PinnedTodos to update
     */
    where?: PinnedTodoWhereInput
    /**
     * Limit how many PinnedTodos to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedTodoIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PinnedTodo upsert
   */
  export type PinnedTodoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedTodo
     */
    select?: PinnedTodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedTodo
     */
    omit?: PinnedTodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedTodoInclude<ExtArgs> | null
    /**
     * The filter to search for the PinnedTodo to update in case it exists.
     */
    where: PinnedTodoWhereUniqueInput
    /**
     * In case the PinnedTodo found by the `where` argument doesn't exist, create a new PinnedTodo with this data.
     */
    create: XOR<PinnedTodoCreateInput, PinnedTodoUncheckedCreateInput>
    /**
     * In case the PinnedTodo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PinnedTodoUpdateInput, PinnedTodoUncheckedUpdateInput>
  }

  /**
   * PinnedTodo delete
   */
  export type PinnedTodoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedTodo
     */
    select?: PinnedTodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedTodo
     */
    omit?: PinnedTodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedTodoInclude<ExtArgs> | null
    /**
     * Filter which PinnedTodo to delete.
     */
    where: PinnedTodoWhereUniqueInput
  }

  /**
   * PinnedTodo deleteMany
   */
  export type PinnedTodoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PinnedTodos to delete
     */
    where?: PinnedTodoWhereInput
    /**
     * Limit how many PinnedTodos to delete.
     */
    limit?: number
  }

  /**
   * PinnedTodo without action
   */
  export type PinnedTodoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PinnedTodo
     */
    select?: PinnedTodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PinnedTodo
     */
    omit?: PinnedTodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PinnedTodoInclude<ExtArgs> | null
  }


  /**
   * Model Tag
   */

  export type AggregateTag = {
    _count: TagCountAggregateOutputType | null
    _min: TagMinAggregateOutputType | null
    _max: TagMaxAggregateOutputType | null
  }

  export type TagMinAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TagMaxAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TagCountAggregateOutputType = {
    id: number
    name: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TagMinAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TagMaxAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TagCountAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TagAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tag to aggregate.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tags
    **/
    _count?: true | TagCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TagMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TagMaxAggregateInputType
  }

  export type GetTagAggregateType<T extends TagAggregateArgs> = {
        [P in keyof T & keyof AggregateTag]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTag[P]>
      : GetScalarType<T[P], AggregateTag[P]>
  }




  export type TagGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TagWhereInput
    orderBy?: TagOrderByWithAggregationInput | TagOrderByWithAggregationInput[]
    by: TagScalarFieldEnum[] | TagScalarFieldEnum
    having?: TagScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TagCountAggregateInputType | true
    _min?: TagMinAggregateInputType
    _max?: TagMaxAggregateInputType
  }

  export type TagGroupByOutputType = {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    _count: TagCountAggregateOutputType | null
    _min: TagMinAggregateOutputType | null
    _max: TagMaxAggregateOutputType | null
  }

  type GetTagGroupByPayload<T extends TagGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TagGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TagGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TagGroupByOutputType[P]>
            : GetScalarType<T[P], TagGroupByOutputType[P]>
        }
      >
    >


  export type TagSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    todos?: boolean | Tag$todosArgs<ExtArgs>
    _count?: boolean | TagCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tag"]>

  export type TagSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tag"]>

  export type TagSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tag"]>

  export type TagSelectScalar = {
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TagOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "createdAt" | "updatedAt", ExtArgs["result"]["tag"]>
  export type TagInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    todos?: boolean | Tag$todosArgs<ExtArgs>
    _count?: boolean | TagCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TagIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type TagIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TagPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tag"
    objects: {
      todos: Prisma.$TodoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tag"]>
    composites: {}
  }

  type TagGetPayload<S extends boolean | null | undefined | TagDefaultArgs> = $Result.GetResult<Prisma.$TagPayload, S>

  type TagCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TagFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TagCountAggregateInputType | true
    }

  export interface TagDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tag'], meta: { name: 'Tag' } }
    /**
     * Find zero or one Tag that matches the filter.
     * @param {TagFindUniqueArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TagFindUniqueArgs>(args: SelectSubset<T, TagFindUniqueArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tag that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TagFindUniqueOrThrowArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TagFindUniqueOrThrowArgs>(args: SelectSubset<T, TagFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tag that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagFindFirstArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TagFindFirstArgs>(args?: SelectSubset<T, TagFindFirstArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tag that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagFindFirstOrThrowArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TagFindFirstOrThrowArgs>(args?: SelectSubset<T, TagFindFirstOrThrowArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tags
     * const tags = await prisma.tag.findMany()
     * 
     * // Get first 10 Tags
     * const tags = await prisma.tag.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tagWithIdOnly = await prisma.tag.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TagFindManyArgs>(args?: SelectSubset<T, TagFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tag.
     * @param {TagCreateArgs} args - Arguments to create a Tag.
     * @example
     * // Create one Tag
     * const Tag = await prisma.tag.create({
     *   data: {
     *     // ... data to create a Tag
     *   }
     * })
     * 
     */
    create<T extends TagCreateArgs>(args: SelectSubset<T, TagCreateArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tags.
     * @param {TagCreateManyArgs} args - Arguments to create many Tags.
     * @example
     * // Create many Tags
     * const tag = await prisma.tag.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TagCreateManyArgs>(args?: SelectSubset<T, TagCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tags and returns the data saved in the database.
     * @param {TagCreateManyAndReturnArgs} args - Arguments to create many Tags.
     * @example
     * // Create many Tags
     * const tag = await prisma.tag.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tags and only return the `id`
     * const tagWithIdOnly = await prisma.tag.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TagCreateManyAndReturnArgs>(args?: SelectSubset<T, TagCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tag.
     * @param {TagDeleteArgs} args - Arguments to delete one Tag.
     * @example
     * // Delete one Tag
     * const Tag = await prisma.tag.delete({
     *   where: {
     *     // ... filter to delete one Tag
     *   }
     * })
     * 
     */
    delete<T extends TagDeleteArgs>(args: SelectSubset<T, TagDeleteArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tag.
     * @param {TagUpdateArgs} args - Arguments to update one Tag.
     * @example
     * // Update one Tag
     * const tag = await prisma.tag.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TagUpdateArgs>(args: SelectSubset<T, TagUpdateArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tags.
     * @param {TagDeleteManyArgs} args - Arguments to filter Tags to delete.
     * @example
     * // Delete a few Tags
     * const { count } = await prisma.tag.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TagDeleteManyArgs>(args?: SelectSubset<T, TagDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tags
     * const tag = await prisma.tag.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TagUpdateManyArgs>(args: SelectSubset<T, TagUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tags and returns the data updated in the database.
     * @param {TagUpdateManyAndReturnArgs} args - Arguments to update many Tags.
     * @example
     * // Update many Tags
     * const tag = await prisma.tag.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tags and only return the `id`
     * const tagWithIdOnly = await prisma.tag.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TagUpdateManyAndReturnArgs>(args: SelectSubset<T, TagUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tag.
     * @param {TagUpsertArgs} args - Arguments to update or create a Tag.
     * @example
     * // Update or create a Tag
     * const tag = await prisma.tag.upsert({
     *   create: {
     *     // ... data to create a Tag
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tag we want to update
     *   }
     * })
     */
    upsert<T extends TagUpsertArgs>(args: SelectSubset<T, TagUpsertArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagCountArgs} args - Arguments to filter Tags to count.
     * @example
     * // Count the number of Tags
     * const count = await prisma.tag.count({
     *   where: {
     *     // ... the filter for the Tags we want to count
     *   }
     * })
    **/
    count<T extends TagCountArgs>(
      args?: Subset<T, TagCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TagCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TagAggregateArgs>(args: Subset<T, TagAggregateArgs>): Prisma.PrismaPromise<GetTagAggregateType<T>>

    /**
     * Group by Tag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TagGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TagGroupByArgs['orderBy'] }
        : { orderBy?: TagGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TagGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTagGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tag model
   */
  readonly fields: TagFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tag.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TagClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    todos<T extends Tag$todosArgs<ExtArgs> = {}>(args?: Subset<T, Tag$todosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TodoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Tag model
   */
  interface TagFieldRefs {
    readonly id: FieldRef<"Tag", 'String'>
    readonly name: FieldRef<"Tag", 'String'>
    readonly createdAt: FieldRef<"Tag", 'DateTime'>
    readonly updatedAt: FieldRef<"Tag", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Tag findUnique
   */
  export type TagFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag findUniqueOrThrow
   */
  export type TagFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag findFirst
   */
  export type TagFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tags.
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tags.
     */
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Tag findFirstOrThrow
   */
  export type TagFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tags.
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tags.
     */
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Tag findMany
   */
  export type TagFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tags to fetch.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tags.
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Tag create
   */
  export type TagCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * The data needed to create a Tag.
     */
    data: XOR<TagCreateInput, TagUncheckedCreateInput>
  }

  /**
   * Tag createMany
   */
  export type TagCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tags.
     */
    data: TagCreateManyInput | TagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tag createManyAndReturn
   */
  export type TagCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * The data used to create many Tags.
     */
    data: TagCreateManyInput | TagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tag update
   */
  export type TagUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * The data needed to update a Tag.
     */
    data: XOR<TagUpdateInput, TagUncheckedUpdateInput>
    /**
     * Choose, which Tag to update.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag updateMany
   */
  export type TagUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tags.
     */
    data: XOR<TagUpdateManyMutationInput, TagUncheckedUpdateManyInput>
    /**
     * Filter which Tags to update
     */
    where?: TagWhereInput
    /**
     * Limit how many Tags to update.
     */
    limit?: number
  }

  /**
   * Tag updateManyAndReturn
   */
  export type TagUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * The data used to update Tags.
     */
    data: XOR<TagUpdateManyMutationInput, TagUncheckedUpdateManyInput>
    /**
     * Filter which Tags to update
     */
    where?: TagWhereInput
    /**
     * Limit how many Tags to update.
     */
    limit?: number
  }

  /**
   * Tag upsert
   */
  export type TagUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * The filter to search for the Tag to update in case it exists.
     */
    where: TagWhereUniqueInput
    /**
     * In case the Tag found by the `where` argument doesn't exist, create a new Tag with this data.
     */
    create: XOR<TagCreateInput, TagUncheckedCreateInput>
    /**
     * In case the Tag was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TagUpdateInput, TagUncheckedUpdateInput>
  }

  /**
   * Tag delete
   */
  export type TagDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter which Tag to delete.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag deleteMany
   */
  export type TagDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tags to delete
     */
    where?: TagWhereInput
    /**
     * Limit how many Tags to delete.
     */
    limit?: number
  }

  /**
   * Tag.todos
   */
  export type Tag$todosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Todo
     */
    select?: TodoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Todo
     */
    omit?: TodoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TodoInclude<ExtArgs> | null
    where?: TodoWhereInput
    orderBy?: TodoOrderByWithRelationInput | TodoOrderByWithRelationInput[]
    cursor?: TodoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TodoScalarFieldEnum | TodoScalarFieldEnum[]
  }

  /**
   * Tag without action
   */
  export type TagDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const TodoScalarFieldEnum: {
    id: 'id',
    title: 'title',
    completed: 'completed',
    completedAt: 'completedAt',
    pinned: 'pinned',
    position: 'position',
    parentId: 'parentId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TodoScalarFieldEnum = (typeof TodoScalarFieldEnum)[keyof typeof TodoScalarFieldEnum]


  export const PinnedListScalarFieldEnum: {
    id: 'id',
    title: 'title',
    position: 'position',
    isPrimary: 'isPrimary',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PinnedListScalarFieldEnum = (typeof PinnedListScalarFieldEnum)[keyof typeof PinnedListScalarFieldEnum]


  export const PinnedTodoScalarFieldEnum: {
    id: 'id',
    pinnedListId: 'pinnedListId',
    todoId: 'todoId',
    position: 'position'
  };

  export type PinnedTodoScalarFieldEnum = (typeof PinnedTodoScalarFieldEnum)[keyof typeof PinnedTodoScalarFieldEnum]


  export const TagScalarFieldEnum: {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TagScalarFieldEnum = (typeof TagScalarFieldEnum)[keyof typeof TagScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type TodoWhereInput = {
    AND?: TodoWhereInput | TodoWhereInput[]
    OR?: TodoWhereInput[]
    NOT?: TodoWhereInput | TodoWhereInput[]
    id?: StringFilter<"Todo"> | string
    title?: StringFilter<"Todo"> | string
    completed?: BoolFilter<"Todo"> | boolean
    completedAt?: DateTimeNullableFilter<"Todo"> | Date | string | null
    pinned?: BoolFilter<"Todo"> | boolean
    position?: IntFilter<"Todo"> | number
    parentId?: StringNullableFilter<"Todo"> | string | null
    createdAt?: DateTimeFilter<"Todo"> | Date | string
    updatedAt?: DateTimeFilter<"Todo"> | Date | string
    parent?: XOR<TodoNullableScalarRelationFilter, TodoWhereInput> | null
    children?: TodoListRelationFilter
    pinnedIn?: PinnedTodoListRelationFilter
    tags?: TagListRelationFilter
  }

  export type TodoOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    completed?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    pinned?: SortOrder
    position?: SortOrder
    parentId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    parent?: TodoOrderByWithRelationInput
    children?: TodoOrderByRelationAggregateInput
    pinnedIn?: PinnedTodoOrderByRelationAggregateInput
    tags?: TagOrderByRelationAggregateInput
  }

  export type TodoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TodoWhereInput | TodoWhereInput[]
    OR?: TodoWhereInput[]
    NOT?: TodoWhereInput | TodoWhereInput[]
    title?: StringFilter<"Todo"> | string
    completed?: BoolFilter<"Todo"> | boolean
    completedAt?: DateTimeNullableFilter<"Todo"> | Date | string | null
    pinned?: BoolFilter<"Todo"> | boolean
    position?: IntFilter<"Todo"> | number
    parentId?: StringNullableFilter<"Todo"> | string | null
    createdAt?: DateTimeFilter<"Todo"> | Date | string
    updatedAt?: DateTimeFilter<"Todo"> | Date | string
    parent?: XOR<TodoNullableScalarRelationFilter, TodoWhereInput> | null
    children?: TodoListRelationFilter
    pinnedIn?: PinnedTodoListRelationFilter
    tags?: TagListRelationFilter
  }, "id">

  export type TodoOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    completed?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    pinned?: SortOrder
    position?: SortOrder
    parentId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TodoCountOrderByAggregateInput
    _avg?: TodoAvgOrderByAggregateInput
    _max?: TodoMaxOrderByAggregateInput
    _min?: TodoMinOrderByAggregateInput
    _sum?: TodoSumOrderByAggregateInput
  }

  export type TodoScalarWhereWithAggregatesInput = {
    AND?: TodoScalarWhereWithAggregatesInput | TodoScalarWhereWithAggregatesInput[]
    OR?: TodoScalarWhereWithAggregatesInput[]
    NOT?: TodoScalarWhereWithAggregatesInput | TodoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Todo"> | string
    title?: StringWithAggregatesFilter<"Todo"> | string
    completed?: BoolWithAggregatesFilter<"Todo"> | boolean
    completedAt?: DateTimeNullableWithAggregatesFilter<"Todo"> | Date | string | null
    pinned?: BoolWithAggregatesFilter<"Todo"> | boolean
    position?: IntWithAggregatesFilter<"Todo"> | number
    parentId?: StringNullableWithAggregatesFilter<"Todo"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Todo"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Todo"> | Date | string
  }

  export type PinnedListWhereInput = {
    AND?: PinnedListWhereInput | PinnedListWhereInput[]
    OR?: PinnedListWhereInput[]
    NOT?: PinnedListWhereInput | PinnedListWhereInput[]
    id?: StringFilter<"PinnedList"> | string
    title?: StringFilter<"PinnedList"> | string
    position?: IntFilter<"PinnedList"> | number
    isPrimary?: BoolFilter<"PinnedList"> | boolean
    isActive?: BoolFilter<"PinnedList"> | boolean
    createdAt?: DateTimeFilter<"PinnedList"> | Date | string
    updatedAt?: DateTimeFilter<"PinnedList"> | Date | string
    todos?: PinnedTodoListRelationFilter
  }

  export type PinnedListOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    position?: SortOrder
    isPrimary?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    todos?: PinnedTodoOrderByRelationAggregateInput
  }

  export type PinnedListWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PinnedListWhereInput | PinnedListWhereInput[]
    OR?: PinnedListWhereInput[]
    NOT?: PinnedListWhereInput | PinnedListWhereInput[]
    title?: StringFilter<"PinnedList"> | string
    position?: IntFilter<"PinnedList"> | number
    isPrimary?: BoolFilter<"PinnedList"> | boolean
    isActive?: BoolFilter<"PinnedList"> | boolean
    createdAt?: DateTimeFilter<"PinnedList"> | Date | string
    updatedAt?: DateTimeFilter<"PinnedList"> | Date | string
    todos?: PinnedTodoListRelationFilter
  }, "id">

  export type PinnedListOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    position?: SortOrder
    isPrimary?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PinnedListCountOrderByAggregateInput
    _avg?: PinnedListAvgOrderByAggregateInput
    _max?: PinnedListMaxOrderByAggregateInput
    _min?: PinnedListMinOrderByAggregateInput
    _sum?: PinnedListSumOrderByAggregateInput
  }

  export type PinnedListScalarWhereWithAggregatesInput = {
    AND?: PinnedListScalarWhereWithAggregatesInput | PinnedListScalarWhereWithAggregatesInput[]
    OR?: PinnedListScalarWhereWithAggregatesInput[]
    NOT?: PinnedListScalarWhereWithAggregatesInput | PinnedListScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PinnedList"> | string
    title?: StringWithAggregatesFilter<"PinnedList"> | string
    position?: IntWithAggregatesFilter<"PinnedList"> | number
    isPrimary?: BoolWithAggregatesFilter<"PinnedList"> | boolean
    isActive?: BoolWithAggregatesFilter<"PinnedList"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"PinnedList"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PinnedList"> | Date | string
  }

  export type PinnedTodoWhereInput = {
    AND?: PinnedTodoWhereInput | PinnedTodoWhereInput[]
    OR?: PinnedTodoWhereInput[]
    NOT?: PinnedTodoWhereInput | PinnedTodoWhereInput[]
    id?: IntFilter<"PinnedTodo"> | number
    pinnedListId?: StringFilter<"PinnedTodo"> | string
    todoId?: StringFilter<"PinnedTodo"> | string
    position?: IntFilter<"PinnedTodo"> | number
    pinnedList?: XOR<PinnedListScalarRelationFilter, PinnedListWhereInput>
    todo?: XOR<TodoScalarRelationFilter, TodoWhereInput>
  }

  export type PinnedTodoOrderByWithRelationInput = {
    id?: SortOrder
    pinnedListId?: SortOrder
    todoId?: SortOrder
    position?: SortOrder
    pinnedList?: PinnedListOrderByWithRelationInput
    todo?: TodoOrderByWithRelationInput
  }

  export type PinnedTodoWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    pinnedListId_todoId?: PinnedTodoPinnedListIdTodoIdCompoundUniqueInput
    AND?: PinnedTodoWhereInput | PinnedTodoWhereInput[]
    OR?: PinnedTodoWhereInput[]
    NOT?: PinnedTodoWhereInput | PinnedTodoWhereInput[]
    pinnedListId?: StringFilter<"PinnedTodo"> | string
    todoId?: StringFilter<"PinnedTodo"> | string
    position?: IntFilter<"PinnedTodo"> | number
    pinnedList?: XOR<PinnedListScalarRelationFilter, PinnedListWhereInput>
    todo?: XOR<TodoScalarRelationFilter, TodoWhereInput>
  }, "id" | "pinnedListId_todoId">

  export type PinnedTodoOrderByWithAggregationInput = {
    id?: SortOrder
    pinnedListId?: SortOrder
    todoId?: SortOrder
    position?: SortOrder
    _count?: PinnedTodoCountOrderByAggregateInput
    _avg?: PinnedTodoAvgOrderByAggregateInput
    _max?: PinnedTodoMaxOrderByAggregateInput
    _min?: PinnedTodoMinOrderByAggregateInput
    _sum?: PinnedTodoSumOrderByAggregateInput
  }

  export type PinnedTodoScalarWhereWithAggregatesInput = {
    AND?: PinnedTodoScalarWhereWithAggregatesInput | PinnedTodoScalarWhereWithAggregatesInput[]
    OR?: PinnedTodoScalarWhereWithAggregatesInput[]
    NOT?: PinnedTodoScalarWhereWithAggregatesInput | PinnedTodoScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"PinnedTodo"> | number
    pinnedListId?: StringWithAggregatesFilter<"PinnedTodo"> | string
    todoId?: StringWithAggregatesFilter<"PinnedTodo"> | string
    position?: IntWithAggregatesFilter<"PinnedTodo"> | number
  }

  export type TagWhereInput = {
    AND?: TagWhereInput | TagWhereInput[]
    OR?: TagWhereInput[]
    NOT?: TagWhereInput | TagWhereInput[]
    id?: StringFilter<"Tag"> | string
    name?: StringFilter<"Tag"> | string
    createdAt?: DateTimeFilter<"Tag"> | Date | string
    updatedAt?: DateTimeFilter<"Tag"> | Date | string
    todos?: TodoListRelationFilter
  }

  export type TagOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    todos?: TodoOrderByRelationAggregateInput
  }

  export type TagWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TagWhereInput | TagWhereInput[]
    OR?: TagWhereInput[]
    NOT?: TagWhereInput | TagWhereInput[]
    name?: StringFilter<"Tag"> | string
    createdAt?: DateTimeFilter<"Tag"> | Date | string
    updatedAt?: DateTimeFilter<"Tag"> | Date | string
    todos?: TodoListRelationFilter
  }, "id">

  export type TagOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TagCountOrderByAggregateInput
    _max?: TagMaxOrderByAggregateInput
    _min?: TagMinOrderByAggregateInput
  }

  export type TagScalarWhereWithAggregatesInput = {
    AND?: TagScalarWhereWithAggregatesInput | TagScalarWhereWithAggregatesInput[]
    OR?: TagScalarWhereWithAggregatesInput[]
    NOT?: TagScalarWhereWithAggregatesInput | TagScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Tag"> | string
    name?: StringWithAggregatesFilter<"Tag"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Tag"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Tag"> | Date | string
  }

  export type TodoCreateInput = {
    id?: string
    title: string
    completed?: boolean
    completedAt?: Date | string | null
    pinned?: boolean
    position: number
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: TodoCreateNestedOneWithoutChildrenInput
    children?: TodoCreateNestedManyWithoutParentInput
    pinnedIn?: PinnedTodoCreateNestedManyWithoutTodoInput
    tags?: TagCreateNestedManyWithoutTodosInput
  }

  export type TodoUncheckedCreateInput = {
    id?: string
    title: string
    completed?: boolean
    completedAt?: Date | string | null
    pinned?: boolean
    position: number
    parentId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: TodoUncheckedCreateNestedManyWithoutParentInput
    pinnedIn?: PinnedTodoUncheckedCreateNestedManyWithoutTodoInput
    tags?: TagUncheckedCreateNestedManyWithoutTodosInput
  }

  export type TodoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pinned?: BoolFieldUpdateOperationsInput | boolean
    position?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: TodoUpdateOneWithoutChildrenNestedInput
    children?: TodoUpdateManyWithoutParentNestedInput
    pinnedIn?: PinnedTodoUpdateManyWithoutTodoNestedInput
    tags?: TagUpdateManyWithoutTodosNestedInput
  }

  export type TodoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pinned?: BoolFieldUpdateOperationsInput | boolean
    position?: IntFieldUpdateOperationsInput | number
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: TodoUncheckedUpdateManyWithoutParentNestedInput
    pinnedIn?: PinnedTodoUncheckedUpdateManyWithoutTodoNestedInput
    tags?: TagUncheckedUpdateManyWithoutTodosNestedInput
  }

  export type TodoCreateManyInput = {
    id?: string
    title: string
    completed?: boolean
    completedAt?: Date | string | null
    pinned?: boolean
    position: number
    parentId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TodoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pinned?: BoolFieldUpdateOperationsInput | boolean
    position?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TodoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pinned?: BoolFieldUpdateOperationsInput | boolean
    position?: IntFieldUpdateOperationsInput | number
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PinnedListCreateInput = {
    id?: string
    title: string
    position: number
    isPrimary?: boolean
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    todos?: PinnedTodoCreateNestedManyWithoutPinnedListInput
  }

  export type PinnedListUncheckedCreateInput = {
    id?: string
    title: string
    position: number
    isPrimary?: boolean
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    todos?: PinnedTodoUncheckedCreateNestedManyWithoutPinnedListInput
  }

  export type PinnedListUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    position?: IntFieldUpdateOperationsInput | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    todos?: PinnedTodoUpdateManyWithoutPinnedListNestedInput
  }

  export type PinnedListUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    position?: IntFieldUpdateOperationsInput | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    todos?: PinnedTodoUncheckedUpdateManyWithoutPinnedListNestedInput
  }

  export type PinnedListCreateManyInput = {
    id?: string
    title: string
    position: number
    isPrimary?: boolean
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PinnedListUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    position?: IntFieldUpdateOperationsInput | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PinnedListUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    position?: IntFieldUpdateOperationsInput | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PinnedTodoCreateInput = {
    position: number
    pinnedList: PinnedListCreateNestedOneWithoutTodosInput
    todo: TodoCreateNestedOneWithoutPinnedInInput
  }

  export type PinnedTodoUncheckedCreateInput = {
    id?: number
    pinnedListId: string
    todoId: string
    position: number
  }

  export type PinnedTodoUpdateInput = {
    position?: IntFieldUpdateOperationsInput | number
    pinnedList?: PinnedListUpdateOneRequiredWithoutTodosNestedInput
    todo?: TodoUpdateOneRequiredWithoutPinnedInNestedInput
  }

  export type PinnedTodoUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    pinnedListId?: StringFieldUpdateOperationsInput | string
    todoId?: StringFieldUpdateOperationsInput | string
    position?: IntFieldUpdateOperationsInput | number
  }

  export type PinnedTodoCreateManyInput = {
    id?: number
    pinnedListId: string
    todoId: string
    position: number
  }

  export type PinnedTodoUpdateManyMutationInput = {
    position?: IntFieldUpdateOperationsInput | number
  }

  export type PinnedTodoUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    pinnedListId?: StringFieldUpdateOperationsInput | string
    todoId?: StringFieldUpdateOperationsInput | string
    position?: IntFieldUpdateOperationsInput | number
  }

  export type TagCreateInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    todos?: TodoCreateNestedManyWithoutTagsInput
  }

  export type TagUncheckedCreateInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    todos?: TodoUncheckedCreateNestedManyWithoutTagsInput
  }

  export type TagUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    todos?: TodoUpdateManyWithoutTagsNestedInput
  }

  export type TagUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    todos?: TodoUncheckedUpdateManyWithoutTagsNestedInput
  }

  export type TagCreateManyInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TagUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TagUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type TodoNullableScalarRelationFilter = {
    is?: TodoWhereInput | null
    isNot?: TodoWhereInput | null
  }

  export type TodoListRelationFilter = {
    every?: TodoWhereInput
    some?: TodoWhereInput
    none?: TodoWhereInput
  }

  export type PinnedTodoListRelationFilter = {
    every?: PinnedTodoWhereInput
    some?: PinnedTodoWhereInput
    none?: PinnedTodoWhereInput
  }

  export type TagListRelationFilter = {
    every?: TagWhereInput
    some?: TagWhereInput
    none?: TagWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type TodoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PinnedTodoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TagOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TodoCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    completed?: SortOrder
    completedAt?: SortOrder
    pinned?: SortOrder
    position?: SortOrder
    parentId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TodoAvgOrderByAggregateInput = {
    position?: SortOrder
  }

  export type TodoMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    completed?: SortOrder
    completedAt?: SortOrder
    pinned?: SortOrder
    position?: SortOrder
    parentId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TodoMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    completed?: SortOrder
    completedAt?: SortOrder
    pinned?: SortOrder
    position?: SortOrder
    parentId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TodoSumOrderByAggregateInput = {
    position?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type PinnedListCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    position?: SortOrder
    isPrimary?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PinnedListAvgOrderByAggregateInput = {
    position?: SortOrder
  }

  export type PinnedListMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    position?: SortOrder
    isPrimary?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PinnedListMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    position?: SortOrder
    isPrimary?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PinnedListSumOrderByAggregateInput = {
    position?: SortOrder
  }

  export type PinnedListScalarRelationFilter = {
    is?: PinnedListWhereInput
    isNot?: PinnedListWhereInput
  }

  export type TodoScalarRelationFilter = {
    is?: TodoWhereInput
    isNot?: TodoWhereInput
  }

  export type PinnedTodoPinnedListIdTodoIdCompoundUniqueInput = {
    pinnedListId: string
    todoId: string
  }

  export type PinnedTodoCountOrderByAggregateInput = {
    id?: SortOrder
    pinnedListId?: SortOrder
    todoId?: SortOrder
    position?: SortOrder
  }

  export type PinnedTodoAvgOrderByAggregateInput = {
    id?: SortOrder
    position?: SortOrder
  }

  export type PinnedTodoMaxOrderByAggregateInput = {
    id?: SortOrder
    pinnedListId?: SortOrder
    todoId?: SortOrder
    position?: SortOrder
  }

  export type PinnedTodoMinOrderByAggregateInput = {
    id?: SortOrder
    pinnedListId?: SortOrder
    todoId?: SortOrder
    position?: SortOrder
  }

  export type PinnedTodoSumOrderByAggregateInput = {
    id?: SortOrder
    position?: SortOrder
  }

  export type TagCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TagMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TagMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TodoCreateNestedOneWithoutChildrenInput = {
    create?: XOR<TodoCreateWithoutChildrenInput, TodoUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: TodoCreateOrConnectWithoutChildrenInput
    connect?: TodoWhereUniqueInput
  }

  export type TodoCreateNestedManyWithoutParentInput = {
    create?: XOR<TodoCreateWithoutParentInput, TodoUncheckedCreateWithoutParentInput> | TodoCreateWithoutParentInput[] | TodoUncheckedCreateWithoutParentInput[]
    connectOrCreate?: TodoCreateOrConnectWithoutParentInput | TodoCreateOrConnectWithoutParentInput[]
    createMany?: TodoCreateManyParentInputEnvelope
    connect?: TodoWhereUniqueInput | TodoWhereUniqueInput[]
  }

  export type PinnedTodoCreateNestedManyWithoutTodoInput = {
    create?: XOR<PinnedTodoCreateWithoutTodoInput, PinnedTodoUncheckedCreateWithoutTodoInput> | PinnedTodoCreateWithoutTodoInput[] | PinnedTodoUncheckedCreateWithoutTodoInput[]
    connectOrCreate?: PinnedTodoCreateOrConnectWithoutTodoInput | PinnedTodoCreateOrConnectWithoutTodoInput[]
    createMany?: PinnedTodoCreateManyTodoInputEnvelope
    connect?: PinnedTodoWhereUniqueInput | PinnedTodoWhereUniqueInput[]
  }

  export type TagCreateNestedManyWithoutTodosInput = {
    create?: XOR<TagCreateWithoutTodosInput, TagUncheckedCreateWithoutTodosInput> | TagCreateWithoutTodosInput[] | TagUncheckedCreateWithoutTodosInput[]
    connectOrCreate?: TagCreateOrConnectWithoutTodosInput | TagCreateOrConnectWithoutTodosInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
  }

  export type TodoUncheckedCreateNestedManyWithoutParentInput = {
    create?: XOR<TodoCreateWithoutParentInput, TodoUncheckedCreateWithoutParentInput> | TodoCreateWithoutParentInput[] | TodoUncheckedCreateWithoutParentInput[]
    connectOrCreate?: TodoCreateOrConnectWithoutParentInput | TodoCreateOrConnectWithoutParentInput[]
    createMany?: TodoCreateManyParentInputEnvelope
    connect?: TodoWhereUniqueInput | TodoWhereUniqueInput[]
  }

  export type PinnedTodoUncheckedCreateNestedManyWithoutTodoInput = {
    create?: XOR<PinnedTodoCreateWithoutTodoInput, PinnedTodoUncheckedCreateWithoutTodoInput> | PinnedTodoCreateWithoutTodoInput[] | PinnedTodoUncheckedCreateWithoutTodoInput[]
    connectOrCreate?: PinnedTodoCreateOrConnectWithoutTodoInput | PinnedTodoCreateOrConnectWithoutTodoInput[]
    createMany?: PinnedTodoCreateManyTodoInputEnvelope
    connect?: PinnedTodoWhereUniqueInput | PinnedTodoWhereUniqueInput[]
  }

  export type TagUncheckedCreateNestedManyWithoutTodosInput = {
    create?: XOR<TagCreateWithoutTodosInput, TagUncheckedCreateWithoutTodosInput> | TagCreateWithoutTodosInput[] | TagUncheckedCreateWithoutTodosInput[]
    connectOrCreate?: TagCreateOrConnectWithoutTodosInput | TagCreateOrConnectWithoutTodosInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type TodoUpdateOneWithoutChildrenNestedInput = {
    create?: XOR<TodoCreateWithoutChildrenInput, TodoUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: TodoCreateOrConnectWithoutChildrenInput
    upsert?: TodoUpsertWithoutChildrenInput
    disconnect?: TodoWhereInput | boolean
    delete?: TodoWhereInput | boolean
    connect?: TodoWhereUniqueInput
    update?: XOR<XOR<TodoUpdateToOneWithWhereWithoutChildrenInput, TodoUpdateWithoutChildrenInput>, TodoUncheckedUpdateWithoutChildrenInput>
  }

  export type TodoUpdateManyWithoutParentNestedInput = {
    create?: XOR<TodoCreateWithoutParentInput, TodoUncheckedCreateWithoutParentInput> | TodoCreateWithoutParentInput[] | TodoUncheckedCreateWithoutParentInput[]
    connectOrCreate?: TodoCreateOrConnectWithoutParentInput | TodoCreateOrConnectWithoutParentInput[]
    upsert?: TodoUpsertWithWhereUniqueWithoutParentInput | TodoUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: TodoCreateManyParentInputEnvelope
    set?: TodoWhereUniqueInput | TodoWhereUniqueInput[]
    disconnect?: TodoWhereUniqueInput | TodoWhereUniqueInput[]
    delete?: TodoWhereUniqueInput | TodoWhereUniqueInput[]
    connect?: TodoWhereUniqueInput | TodoWhereUniqueInput[]
    update?: TodoUpdateWithWhereUniqueWithoutParentInput | TodoUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: TodoUpdateManyWithWhereWithoutParentInput | TodoUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: TodoScalarWhereInput | TodoScalarWhereInput[]
  }

  export type PinnedTodoUpdateManyWithoutTodoNestedInput = {
    create?: XOR<PinnedTodoCreateWithoutTodoInput, PinnedTodoUncheckedCreateWithoutTodoInput> | PinnedTodoCreateWithoutTodoInput[] | PinnedTodoUncheckedCreateWithoutTodoInput[]
    connectOrCreate?: PinnedTodoCreateOrConnectWithoutTodoInput | PinnedTodoCreateOrConnectWithoutTodoInput[]
    upsert?: PinnedTodoUpsertWithWhereUniqueWithoutTodoInput | PinnedTodoUpsertWithWhereUniqueWithoutTodoInput[]
    createMany?: PinnedTodoCreateManyTodoInputEnvelope
    set?: PinnedTodoWhereUniqueInput | PinnedTodoWhereUniqueInput[]
    disconnect?: PinnedTodoWhereUniqueInput | PinnedTodoWhereUniqueInput[]
    delete?: PinnedTodoWhereUniqueInput | PinnedTodoWhereUniqueInput[]
    connect?: PinnedTodoWhereUniqueInput | PinnedTodoWhereUniqueInput[]
    update?: PinnedTodoUpdateWithWhereUniqueWithoutTodoInput | PinnedTodoUpdateWithWhereUniqueWithoutTodoInput[]
    updateMany?: PinnedTodoUpdateManyWithWhereWithoutTodoInput | PinnedTodoUpdateManyWithWhereWithoutTodoInput[]
    deleteMany?: PinnedTodoScalarWhereInput | PinnedTodoScalarWhereInput[]
  }

  export type TagUpdateManyWithoutTodosNestedInput = {
    create?: XOR<TagCreateWithoutTodosInput, TagUncheckedCreateWithoutTodosInput> | TagCreateWithoutTodosInput[] | TagUncheckedCreateWithoutTodosInput[]
    connectOrCreate?: TagCreateOrConnectWithoutTodosInput | TagCreateOrConnectWithoutTodosInput[]
    upsert?: TagUpsertWithWhereUniqueWithoutTodosInput | TagUpsertWithWhereUniqueWithoutTodosInput[]
    set?: TagWhereUniqueInput | TagWhereUniqueInput[]
    disconnect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    delete?: TagWhereUniqueInput | TagWhereUniqueInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    update?: TagUpdateWithWhereUniqueWithoutTodosInput | TagUpdateWithWhereUniqueWithoutTodosInput[]
    updateMany?: TagUpdateManyWithWhereWithoutTodosInput | TagUpdateManyWithWhereWithoutTodosInput[]
    deleteMany?: TagScalarWhereInput | TagScalarWhereInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type TodoUncheckedUpdateManyWithoutParentNestedInput = {
    create?: XOR<TodoCreateWithoutParentInput, TodoUncheckedCreateWithoutParentInput> | TodoCreateWithoutParentInput[] | TodoUncheckedCreateWithoutParentInput[]
    connectOrCreate?: TodoCreateOrConnectWithoutParentInput | TodoCreateOrConnectWithoutParentInput[]
    upsert?: TodoUpsertWithWhereUniqueWithoutParentInput | TodoUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: TodoCreateManyParentInputEnvelope
    set?: TodoWhereUniqueInput | TodoWhereUniqueInput[]
    disconnect?: TodoWhereUniqueInput | TodoWhereUniqueInput[]
    delete?: TodoWhereUniqueInput | TodoWhereUniqueInput[]
    connect?: TodoWhereUniqueInput | TodoWhereUniqueInput[]
    update?: TodoUpdateWithWhereUniqueWithoutParentInput | TodoUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: TodoUpdateManyWithWhereWithoutParentInput | TodoUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: TodoScalarWhereInput | TodoScalarWhereInput[]
  }

  export type PinnedTodoUncheckedUpdateManyWithoutTodoNestedInput = {
    create?: XOR<PinnedTodoCreateWithoutTodoInput, PinnedTodoUncheckedCreateWithoutTodoInput> | PinnedTodoCreateWithoutTodoInput[] | PinnedTodoUncheckedCreateWithoutTodoInput[]
    connectOrCreate?: PinnedTodoCreateOrConnectWithoutTodoInput | PinnedTodoCreateOrConnectWithoutTodoInput[]
    upsert?: PinnedTodoUpsertWithWhereUniqueWithoutTodoInput | PinnedTodoUpsertWithWhereUniqueWithoutTodoInput[]
    createMany?: PinnedTodoCreateManyTodoInputEnvelope
    set?: PinnedTodoWhereUniqueInput | PinnedTodoWhereUniqueInput[]
    disconnect?: PinnedTodoWhereUniqueInput | PinnedTodoWhereUniqueInput[]
    delete?: PinnedTodoWhereUniqueInput | PinnedTodoWhereUniqueInput[]
    connect?: PinnedTodoWhereUniqueInput | PinnedTodoWhereUniqueInput[]
    update?: PinnedTodoUpdateWithWhereUniqueWithoutTodoInput | PinnedTodoUpdateWithWhereUniqueWithoutTodoInput[]
    updateMany?: PinnedTodoUpdateManyWithWhereWithoutTodoInput | PinnedTodoUpdateManyWithWhereWithoutTodoInput[]
    deleteMany?: PinnedTodoScalarWhereInput | PinnedTodoScalarWhereInput[]
  }

  export type TagUncheckedUpdateManyWithoutTodosNestedInput = {
    create?: XOR<TagCreateWithoutTodosInput, TagUncheckedCreateWithoutTodosInput> | TagCreateWithoutTodosInput[] | TagUncheckedCreateWithoutTodosInput[]
    connectOrCreate?: TagCreateOrConnectWithoutTodosInput | TagCreateOrConnectWithoutTodosInput[]
    upsert?: TagUpsertWithWhereUniqueWithoutTodosInput | TagUpsertWithWhereUniqueWithoutTodosInput[]
    set?: TagWhereUniqueInput | TagWhereUniqueInput[]
    disconnect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    delete?: TagWhereUniqueInput | TagWhereUniqueInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    update?: TagUpdateWithWhereUniqueWithoutTodosInput | TagUpdateWithWhereUniqueWithoutTodosInput[]
    updateMany?: TagUpdateManyWithWhereWithoutTodosInput | TagUpdateManyWithWhereWithoutTodosInput[]
    deleteMany?: TagScalarWhereInput | TagScalarWhereInput[]
  }

  export type PinnedTodoCreateNestedManyWithoutPinnedListInput = {
    create?: XOR<PinnedTodoCreateWithoutPinnedListInput, PinnedTodoUncheckedCreateWithoutPinnedListInput> | PinnedTodoCreateWithoutPinnedListInput[] | PinnedTodoUncheckedCreateWithoutPinnedListInput[]
    connectOrCreate?: PinnedTodoCreateOrConnectWithoutPinnedListInput | PinnedTodoCreateOrConnectWithoutPinnedListInput[]
    createMany?: PinnedTodoCreateManyPinnedListInputEnvelope
    connect?: PinnedTodoWhereUniqueInput | PinnedTodoWhereUniqueInput[]
  }

  export type PinnedTodoUncheckedCreateNestedManyWithoutPinnedListInput = {
    create?: XOR<PinnedTodoCreateWithoutPinnedListInput, PinnedTodoUncheckedCreateWithoutPinnedListInput> | PinnedTodoCreateWithoutPinnedListInput[] | PinnedTodoUncheckedCreateWithoutPinnedListInput[]
    connectOrCreate?: PinnedTodoCreateOrConnectWithoutPinnedListInput | PinnedTodoCreateOrConnectWithoutPinnedListInput[]
    createMany?: PinnedTodoCreateManyPinnedListInputEnvelope
    connect?: PinnedTodoWhereUniqueInput | PinnedTodoWhereUniqueInput[]
  }

  export type PinnedTodoUpdateManyWithoutPinnedListNestedInput = {
    create?: XOR<PinnedTodoCreateWithoutPinnedListInput, PinnedTodoUncheckedCreateWithoutPinnedListInput> | PinnedTodoCreateWithoutPinnedListInput[] | PinnedTodoUncheckedCreateWithoutPinnedListInput[]
    connectOrCreate?: PinnedTodoCreateOrConnectWithoutPinnedListInput | PinnedTodoCreateOrConnectWithoutPinnedListInput[]
    upsert?: PinnedTodoUpsertWithWhereUniqueWithoutPinnedListInput | PinnedTodoUpsertWithWhereUniqueWithoutPinnedListInput[]
    createMany?: PinnedTodoCreateManyPinnedListInputEnvelope
    set?: PinnedTodoWhereUniqueInput | PinnedTodoWhereUniqueInput[]
    disconnect?: PinnedTodoWhereUniqueInput | PinnedTodoWhereUniqueInput[]
    delete?: PinnedTodoWhereUniqueInput | PinnedTodoWhereUniqueInput[]
    connect?: PinnedTodoWhereUniqueInput | PinnedTodoWhereUniqueInput[]
    update?: PinnedTodoUpdateWithWhereUniqueWithoutPinnedListInput | PinnedTodoUpdateWithWhereUniqueWithoutPinnedListInput[]
    updateMany?: PinnedTodoUpdateManyWithWhereWithoutPinnedListInput | PinnedTodoUpdateManyWithWhereWithoutPinnedListInput[]
    deleteMany?: PinnedTodoScalarWhereInput | PinnedTodoScalarWhereInput[]
  }

  export type PinnedTodoUncheckedUpdateManyWithoutPinnedListNestedInput = {
    create?: XOR<PinnedTodoCreateWithoutPinnedListInput, PinnedTodoUncheckedCreateWithoutPinnedListInput> | PinnedTodoCreateWithoutPinnedListInput[] | PinnedTodoUncheckedCreateWithoutPinnedListInput[]
    connectOrCreate?: PinnedTodoCreateOrConnectWithoutPinnedListInput | PinnedTodoCreateOrConnectWithoutPinnedListInput[]
    upsert?: PinnedTodoUpsertWithWhereUniqueWithoutPinnedListInput | PinnedTodoUpsertWithWhereUniqueWithoutPinnedListInput[]
    createMany?: PinnedTodoCreateManyPinnedListInputEnvelope
    set?: PinnedTodoWhereUniqueInput | PinnedTodoWhereUniqueInput[]
    disconnect?: PinnedTodoWhereUniqueInput | PinnedTodoWhereUniqueInput[]
    delete?: PinnedTodoWhereUniqueInput | PinnedTodoWhereUniqueInput[]
    connect?: PinnedTodoWhereUniqueInput | PinnedTodoWhereUniqueInput[]
    update?: PinnedTodoUpdateWithWhereUniqueWithoutPinnedListInput | PinnedTodoUpdateWithWhereUniqueWithoutPinnedListInput[]
    updateMany?: PinnedTodoUpdateManyWithWhereWithoutPinnedListInput | PinnedTodoUpdateManyWithWhereWithoutPinnedListInput[]
    deleteMany?: PinnedTodoScalarWhereInput | PinnedTodoScalarWhereInput[]
  }

  export type PinnedListCreateNestedOneWithoutTodosInput = {
    create?: XOR<PinnedListCreateWithoutTodosInput, PinnedListUncheckedCreateWithoutTodosInput>
    connectOrCreate?: PinnedListCreateOrConnectWithoutTodosInput
    connect?: PinnedListWhereUniqueInput
  }

  export type TodoCreateNestedOneWithoutPinnedInInput = {
    create?: XOR<TodoCreateWithoutPinnedInInput, TodoUncheckedCreateWithoutPinnedInInput>
    connectOrCreate?: TodoCreateOrConnectWithoutPinnedInInput
    connect?: TodoWhereUniqueInput
  }

  export type PinnedListUpdateOneRequiredWithoutTodosNestedInput = {
    create?: XOR<PinnedListCreateWithoutTodosInput, PinnedListUncheckedCreateWithoutTodosInput>
    connectOrCreate?: PinnedListCreateOrConnectWithoutTodosInput
    upsert?: PinnedListUpsertWithoutTodosInput
    connect?: PinnedListWhereUniqueInput
    update?: XOR<XOR<PinnedListUpdateToOneWithWhereWithoutTodosInput, PinnedListUpdateWithoutTodosInput>, PinnedListUncheckedUpdateWithoutTodosInput>
  }

  export type TodoUpdateOneRequiredWithoutPinnedInNestedInput = {
    create?: XOR<TodoCreateWithoutPinnedInInput, TodoUncheckedCreateWithoutPinnedInInput>
    connectOrCreate?: TodoCreateOrConnectWithoutPinnedInInput
    upsert?: TodoUpsertWithoutPinnedInInput
    connect?: TodoWhereUniqueInput
    update?: XOR<XOR<TodoUpdateToOneWithWhereWithoutPinnedInInput, TodoUpdateWithoutPinnedInInput>, TodoUncheckedUpdateWithoutPinnedInInput>
  }

  export type TodoCreateNestedManyWithoutTagsInput = {
    create?: XOR<TodoCreateWithoutTagsInput, TodoUncheckedCreateWithoutTagsInput> | TodoCreateWithoutTagsInput[] | TodoUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: TodoCreateOrConnectWithoutTagsInput | TodoCreateOrConnectWithoutTagsInput[]
    connect?: TodoWhereUniqueInput | TodoWhereUniqueInput[]
  }

  export type TodoUncheckedCreateNestedManyWithoutTagsInput = {
    create?: XOR<TodoCreateWithoutTagsInput, TodoUncheckedCreateWithoutTagsInput> | TodoCreateWithoutTagsInput[] | TodoUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: TodoCreateOrConnectWithoutTagsInput | TodoCreateOrConnectWithoutTagsInput[]
    connect?: TodoWhereUniqueInput | TodoWhereUniqueInput[]
  }

  export type TodoUpdateManyWithoutTagsNestedInput = {
    create?: XOR<TodoCreateWithoutTagsInput, TodoUncheckedCreateWithoutTagsInput> | TodoCreateWithoutTagsInput[] | TodoUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: TodoCreateOrConnectWithoutTagsInput | TodoCreateOrConnectWithoutTagsInput[]
    upsert?: TodoUpsertWithWhereUniqueWithoutTagsInput | TodoUpsertWithWhereUniqueWithoutTagsInput[]
    set?: TodoWhereUniqueInput | TodoWhereUniqueInput[]
    disconnect?: TodoWhereUniqueInput | TodoWhereUniqueInput[]
    delete?: TodoWhereUniqueInput | TodoWhereUniqueInput[]
    connect?: TodoWhereUniqueInput | TodoWhereUniqueInput[]
    update?: TodoUpdateWithWhereUniqueWithoutTagsInput | TodoUpdateWithWhereUniqueWithoutTagsInput[]
    updateMany?: TodoUpdateManyWithWhereWithoutTagsInput | TodoUpdateManyWithWhereWithoutTagsInput[]
    deleteMany?: TodoScalarWhereInput | TodoScalarWhereInput[]
  }

  export type TodoUncheckedUpdateManyWithoutTagsNestedInput = {
    create?: XOR<TodoCreateWithoutTagsInput, TodoUncheckedCreateWithoutTagsInput> | TodoCreateWithoutTagsInput[] | TodoUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: TodoCreateOrConnectWithoutTagsInput | TodoCreateOrConnectWithoutTagsInput[]
    upsert?: TodoUpsertWithWhereUniqueWithoutTagsInput | TodoUpsertWithWhereUniqueWithoutTagsInput[]
    set?: TodoWhereUniqueInput | TodoWhereUniqueInput[]
    disconnect?: TodoWhereUniqueInput | TodoWhereUniqueInput[]
    delete?: TodoWhereUniqueInput | TodoWhereUniqueInput[]
    connect?: TodoWhereUniqueInput | TodoWhereUniqueInput[]
    update?: TodoUpdateWithWhereUniqueWithoutTagsInput | TodoUpdateWithWhereUniqueWithoutTagsInput[]
    updateMany?: TodoUpdateManyWithWhereWithoutTagsInput | TodoUpdateManyWithWhereWithoutTagsInput[]
    deleteMany?: TodoScalarWhereInput | TodoScalarWhereInput[]
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type TodoCreateWithoutChildrenInput = {
    id?: string
    title: string
    completed?: boolean
    completedAt?: Date | string | null
    pinned?: boolean
    position: number
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: TodoCreateNestedOneWithoutChildrenInput
    pinnedIn?: PinnedTodoCreateNestedManyWithoutTodoInput
    tags?: TagCreateNestedManyWithoutTodosInput
  }

  export type TodoUncheckedCreateWithoutChildrenInput = {
    id?: string
    title: string
    completed?: boolean
    completedAt?: Date | string | null
    pinned?: boolean
    position: number
    parentId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    pinnedIn?: PinnedTodoUncheckedCreateNestedManyWithoutTodoInput
    tags?: TagUncheckedCreateNestedManyWithoutTodosInput
  }

  export type TodoCreateOrConnectWithoutChildrenInput = {
    where: TodoWhereUniqueInput
    create: XOR<TodoCreateWithoutChildrenInput, TodoUncheckedCreateWithoutChildrenInput>
  }

  export type TodoCreateWithoutParentInput = {
    id?: string
    title: string
    completed?: boolean
    completedAt?: Date | string | null
    pinned?: boolean
    position: number
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: TodoCreateNestedManyWithoutParentInput
    pinnedIn?: PinnedTodoCreateNestedManyWithoutTodoInput
    tags?: TagCreateNestedManyWithoutTodosInput
  }

  export type TodoUncheckedCreateWithoutParentInput = {
    id?: string
    title: string
    completed?: boolean
    completedAt?: Date | string | null
    pinned?: boolean
    position: number
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: TodoUncheckedCreateNestedManyWithoutParentInput
    pinnedIn?: PinnedTodoUncheckedCreateNestedManyWithoutTodoInput
    tags?: TagUncheckedCreateNestedManyWithoutTodosInput
  }

  export type TodoCreateOrConnectWithoutParentInput = {
    where: TodoWhereUniqueInput
    create: XOR<TodoCreateWithoutParentInput, TodoUncheckedCreateWithoutParentInput>
  }

  export type TodoCreateManyParentInputEnvelope = {
    data: TodoCreateManyParentInput | TodoCreateManyParentInput[]
    skipDuplicates?: boolean
  }

  export type PinnedTodoCreateWithoutTodoInput = {
    position: number
    pinnedList: PinnedListCreateNestedOneWithoutTodosInput
  }

  export type PinnedTodoUncheckedCreateWithoutTodoInput = {
    id?: number
    pinnedListId: string
    position: number
  }

  export type PinnedTodoCreateOrConnectWithoutTodoInput = {
    where: PinnedTodoWhereUniqueInput
    create: XOR<PinnedTodoCreateWithoutTodoInput, PinnedTodoUncheckedCreateWithoutTodoInput>
  }

  export type PinnedTodoCreateManyTodoInputEnvelope = {
    data: PinnedTodoCreateManyTodoInput | PinnedTodoCreateManyTodoInput[]
    skipDuplicates?: boolean
  }

  export type TagCreateWithoutTodosInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TagUncheckedCreateWithoutTodosInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TagCreateOrConnectWithoutTodosInput = {
    where: TagWhereUniqueInput
    create: XOR<TagCreateWithoutTodosInput, TagUncheckedCreateWithoutTodosInput>
  }

  export type TodoUpsertWithoutChildrenInput = {
    update: XOR<TodoUpdateWithoutChildrenInput, TodoUncheckedUpdateWithoutChildrenInput>
    create: XOR<TodoCreateWithoutChildrenInput, TodoUncheckedCreateWithoutChildrenInput>
    where?: TodoWhereInput
  }

  export type TodoUpdateToOneWithWhereWithoutChildrenInput = {
    where?: TodoWhereInput
    data: XOR<TodoUpdateWithoutChildrenInput, TodoUncheckedUpdateWithoutChildrenInput>
  }

  export type TodoUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pinned?: BoolFieldUpdateOperationsInput | boolean
    position?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: TodoUpdateOneWithoutChildrenNestedInput
    pinnedIn?: PinnedTodoUpdateManyWithoutTodoNestedInput
    tags?: TagUpdateManyWithoutTodosNestedInput
  }

  export type TodoUncheckedUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pinned?: BoolFieldUpdateOperationsInput | boolean
    position?: IntFieldUpdateOperationsInput | number
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pinnedIn?: PinnedTodoUncheckedUpdateManyWithoutTodoNestedInput
    tags?: TagUncheckedUpdateManyWithoutTodosNestedInput
  }

  export type TodoUpsertWithWhereUniqueWithoutParentInput = {
    where: TodoWhereUniqueInput
    update: XOR<TodoUpdateWithoutParentInput, TodoUncheckedUpdateWithoutParentInput>
    create: XOR<TodoCreateWithoutParentInput, TodoUncheckedCreateWithoutParentInput>
  }

  export type TodoUpdateWithWhereUniqueWithoutParentInput = {
    where: TodoWhereUniqueInput
    data: XOR<TodoUpdateWithoutParentInput, TodoUncheckedUpdateWithoutParentInput>
  }

  export type TodoUpdateManyWithWhereWithoutParentInput = {
    where: TodoScalarWhereInput
    data: XOR<TodoUpdateManyMutationInput, TodoUncheckedUpdateManyWithoutParentInput>
  }

  export type TodoScalarWhereInput = {
    AND?: TodoScalarWhereInput | TodoScalarWhereInput[]
    OR?: TodoScalarWhereInput[]
    NOT?: TodoScalarWhereInput | TodoScalarWhereInput[]
    id?: StringFilter<"Todo"> | string
    title?: StringFilter<"Todo"> | string
    completed?: BoolFilter<"Todo"> | boolean
    completedAt?: DateTimeNullableFilter<"Todo"> | Date | string | null
    pinned?: BoolFilter<"Todo"> | boolean
    position?: IntFilter<"Todo"> | number
    parentId?: StringNullableFilter<"Todo"> | string | null
    createdAt?: DateTimeFilter<"Todo"> | Date | string
    updatedAt?: DateTimeFilter<"Todo"> | Date | string
  }

  export type PinnedTodoUpsertWithWhereUniqueWithoutTodoInput = {
    where: PinnedTodoWhereUniqueInput
    update: XOR<PinnedTodoUpdateWithoutTodoInput, PinnedTodoUncheckedUpdateWithoutTodoInput>
    create: XOR<PinnedTodoCreateWithoutTodoInput, PinnedTodoUncheckedCreateWithoutTodoInput>
  }

  export type PinnedTodoUpdateWithWhereUniqueWithoutTodoInput = {
    where: PinnedTodoWhereUniqueInput
    data: XOR<PinnedTodoUpdateWithoutTodoInput, PinnedTodoUncheckedUpdateWithoutTodoInput>
  }

  export type PinnedTodoUpdateManyWithWhereWithoutTodoInput = {
    where: PinnedTodoScalarWhereInput
    data: XOR<PinnedTodoUpdateManyMutationInput, PinnedTodoUncheckedUpdateManyWithoutTodoInput>
  }

  export type PinnedTodoScalarWhereInput = {
    AND?: PinnedTodoScalarWhereInput | PinnedTodoScalarWhereInput[]
    OR?: PinnedTodoScalarWhereInput[]
    NOT?: PinnedTodoScalarWhereInput | PinnedTodoScalarWhereInput[]
    id?: IntFilter<"PinnedTodo"> | number
    pinnedListId?: StringFilter<"PinnedTodo"> | string
    todoId?: StringFilter<"PinnedTodo"> | string
    position?: IntFilter<"PinnedTodo"> | number
  }

  export type TagUpsertWithWhereUniqueWithoutTodosInput = {
    where: TagWhereUniqueInput
    update: XOR<TagUpdateWithoutTodosInput, TagUncheckedUpdateWithoutTodosInput>
    create: XOR<TagCreateWithoutTodosInput, TagUncheckedCreateWithoutTodosInput>
  }

  export type TagUpdateWithWhereUniqueWithoutTodosInput = {
    where: TagWhereUniqueInput
    data: XOR<TagUpdateWithoutTodosInput, TagUncheckedUpdateWithoutTodosInput>
  }

  export type TagUpdateManyWithWhereWithoutTodosInput = {
    where: TagScalarWhereInput
    data: XOR<TagUpdateManyMutationInput, TagUncheckedUpdateManyWithoutTodosInput>
  }

  export type TagScalarWhereInput = {
    AND?: TagScalarWhereInput | TagScalarWhereInput[]
    OR?: TagScalarWhereInput[]
    NOT?: TagScalarWhereInput | TagScalarWhereInput[]
    id?: StringFilter<"Tag"> | string
    name?: StringFilter<"Tag"> | string
    createdAt?: DateTimeFilter<"Tag"> | Date | string
    updatedAt?: DateTimeFilter<"Tag"> | Date | string
  }

  export type PinnedTodoCreateWithoutPinnedListInput = {
    position: number
    todo: TodoCreateNestedOneWithoutPinnedInInput
  }

  export type PinnedTodoUncheckedCreateWithoutPinnedListInput = {
    id?: number
    todoId: string
    position: number
  }

  export type PinnedTodoCreateOrConnectWithoutPinnedListInput = {
    where: PinnedTodoWhereUniqueInput
    create: XOR<PinnedTodoCreateWithoutPinnedListInput, PinnedTodoUncheckedCreateWithoutPinnedListInput>
  }

  export type PinnedTodoCreateManyPinnedListInputEnvelope = {
    data: PinnedTodoCreateManyPinnedListInput | PinnedTodoCreateManyPinnedListInput[]
    skipDuplicates?: boolean
  }

  export type PinnedTodoUpsertWithWhereUniqueWithoutPinnedListInput = {
    where: PinnedTodoWhereUniqueInput
    update: XOR<PinnedTodoUpdateWithoutPinnedListInput, PinnedTodoUncheckedUpdateWithoutPinnedListInput>
    create: XOR<PinnedTodoCreateWithoutPinnedListInput, PinnedTodoUncheckedCreateWithoutPinnedListInput>
  }

  export type PinnedTodoUpdateWithWhereUniqueWithoutPinnedListInput = {
    where: PinnedTodoWhereUniqueInput
    data: XOR<PinnedTodoUpdateWithoutPinnedListInput, PinnedTodoUncheckedUpdateWithoutPinnedListInput>
  }

  export type PinnedTodoUpdateManyWithWhereWithoutPinnedListInput = {
    where: PinnedTodoScalarWhereInput
    data: XOR<PinnedTodoUpdateManyMutationInput, PinnedTodoUncheckedUpdateManyWithoutPinnedListInput>
  }

  export type PinnedListCreateWithoutTodosInput = {
    id?: string
    title: string
    position: number
    isPrimary?: boolean
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PinnedListUncheckedCreateWithoutTodosInput = {
    id?: string
    title: string
    position: number
    isPrimary?: boolean
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PinnedListCreateOrConnectWithoutTodosInput = {
    where: PinnedListWhereUniqueInput
    create: XOR<PinnedListCreateWithoutTodosInput, PinnedListUncheckedCreateWithoutTodosInput>
  }

  export type TodoCreateWithoutPinnedInInput = {
    id?: string
    title: string
    completed?: boolean
    completedAt?: Date | string | null
    pinned?: boolean
    position: number
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: TodoCreateNestedOneWithoutChildrenInput
    children?: TodoCreateNestedManyWithoutParentInput
    tags?: TagCreateNestedManyWithoutTodosInput
  }

  export type TodoUncheckedCreateWithoutPinnedInInput = {
    id?: string
    title: string
    completed?: boolean
    completedAt?: Date | string | null
    pinned?: boolean
    position: number
    parentId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: TodoUncheckedCreateNestedManyWithoutParentInput
    tags?: TagUncheckedCreateNestedManyWithoutTodosInput
  }

  export type TodoCreateOrConnectWithoutPinnedInInput = {
    where: TodoWhereUniqueInput
    create: XOR<TodoCreateWithoutPinnedInInput, TodoUncheckedCreateWithoutPinnedInInput>
  }

  export type PinnedListUpsertWithoutTodosInput = {
    update: XOR<PinnedListUpdateWithoutTodosInput, PinnedListUncheckedUpdateWithoutTodosInput>
    create: XOR<PinnedListCreateWithoutTodosInput, PinnedListUncheckedCreateWithoutTodosInput>
    where?: PinnedListWhereInput
  }

  export type PinnedListUpdateToOneWithWhereWithoutTodosInput = {
    where?: PinnedListWhereInput
    data: XOR<PinnedListUpdateWithoutTodosInput, PinnedListUncheckedUpdateWithoutTodosInput>
  }

  export type PinnedListUpdateWithoutTodosInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    position?: IntFieldUpdateOperationsInput | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PinnedListUncheckedUpdateWithoutTodosInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    position?: IntFieldUpdateOperationsInput | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TodoUpsertWithoutPinnedInInput = {
    update: XOR<TodoUpdateWithoutPinnedInInput, TodoUncheckedUpdateWithoutPinnedInInput>
    create: XOR<TodoCreateWithoutPinnedInInput, TodoUncheckedCreateWithoutPinnedInInput>
    where?: TodoWhereInput
  }

  export type TodoUpdateToOneWithWhereWithoutPinnedInInput = {
    where?: TodoWhereInput
    data: XOR<TodoUpdateWithoutPinnedInInput, TodoUncheckedUpdateWithoutPinnedInInput>
  }

  export type TodoUpdateWithoutPinnedInInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pinned?: BoolFieldUpdateOperationsInput | boolean
    position?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: TodoUpdateOneWithoutChildrenNestedInput
    children?: TodoUpdateManyWithoutParentNestedInput
    tags?: TagUpdateManyWithoutTodosNestedInput
  }

  export type TodoUncheckedUpdateWithoutPinnedInInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pinned?: BoolFieldUpdateOperationsInput | boolean
    position?: IntFieldUpdateOperationsInput | number
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: TodoUncheckedUpdateManyWithoutParentNestedInput
    tags?: TagUncheckedUpdateManyWithoutTodosNestedInput
  }

  export type TodoCreateWithoutTagsInput = {
    id?: string
    title: string
    completed?: boolean
    completedAt?: Date | string | null
    pinned?: boolean
    position: number
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: TodoCreateNestedOneWithoutChildrenInput
    children?: TodoCreateNestedManyWithoutParentInput
    pinnedIn?: PinnedTodoCreateNestedManyWithoutTodoInput
  }

  export type TodoUncheckedCreateWithoutTagsInput = {
    id?: string
    title: string
    completed?: boolean
    completedAt?: Date | string | null
    pinned?: boolean
    position: number
    parentId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: TodoUncheckedCreateNestedManyWithoutParentInput
    pinnedIn?: PinnedTodoUncheckedCreateNestedManyWithoutTodoInput
  }

  export type TodoCreateOrConnectWithoutTagsInput = {
    where: TodoWhereUniqueInput
    create: XOR<TodoCreateWithoutTagsInput, TodoUncheckedCreateWithoutTagsInput>
  }

  export type TodoUpsertWithWhereUniqueWithoutTagsInput = {
    where: TodoWhereUniqueInput
    update: XOR<TodoUpdateWithoutTagsInput, TodoUncheckedUpdateWithoutTagsInput>
    create: XOR<TodoCreateWithoutTagsInput, TodoUncheckedCreateWithoutTagsInput>
  }

  export type TodoUpdateWithWhereUniqueWithoutTagsInput = {
    where: TodoWhereUniqueInput
    data: XOR<TodoUpdateWithoutTagsInput, TodoUncheckedUpdateWithoutTagsInput>
  }

  export type TodoUpdateManyWithWhereWithoutTagsInput = {
    where: TodoScalarWhereInput
    data: XOR<TodoUpdateManyMutationInput, TodoUncheckedUpdateManyWithoutTagsInput>
  }

  export type TodoCreateManyParentInput = {
    id?: string
    title: string
    completed?: boolean
    completedAt?: Date | string | null
    pinned?: boolean
    position: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PinnedTodoCreateManyTodoInput = {
    id?: number
    pinnedListId: string
    position: number
  }

  export type TodoUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pinned?: BoolFieldUpdateOperationsInput | boolean
    position?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: TodoUpdateManyWithoutParentNestedInput
    pinnedIn?: PinnedTodoUpdateManyWithoutTodoNestedInput
    tags?: TagUpdateManyWithoutTodosNestedInput
  }

  export type TodoUncheckedUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pinned?: BoolFieldUpdateOperationsInput | boolean
    position?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: TodoUncheckedUpdateManyWithoutParentNestedInput
    pinnedIn?: PinnedTodoUncheckedUpdateManyWithoutTodoNestedInput
    tags?: TagUncheckedUpdateManyWithoutTodosNestedInput
  }

  export type TodoUncheckedUpdateManyWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pinned?: BoolFieldUpdateOperationsInput | boolean
    position?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PinnedTodoUpdateWithoutTodoInput = {
    position?: IntFieldUpdateOperationsInput | number
    pinnedList?: PinnedListUpdateOneRequiredWithoutTodosNestedInput
  }

  export type PinnedTodoUncheckedUpdateWithoutTodoInput = {
    id?: IntFieldUpdateOperationsInput | number
    pinnedListId?: StringFieldUpdateOperationsInput | string
    position?: IntFieldUpdateOperationsInput | number
  }

  export type PinnedTodoUncheckedUpdateManyWithoutTodoInput = {
    id?: IntFieldUpdateOperationsInput | number
    pinnedListId?: StringFieldUpdateOperationsInput | string
    position?: IntFieldUpdateOperationsInput | number
  }

  export type TagUpdateWithoutTodosInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TagUncheckedUpdateWithoutTodosInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TagUncheckedUpdateManyWithoutTodosInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PinnedTodoCreateManyPinnedListInput = {
    id?: number
    todoId: string
    position: number
  }

  export type PinnedTodoUpdateWithoutPinnedListInput = {
    position?: IntFieldUpdateOperationsInput | number
    todo?: TodoUpdateOneRequiredWithoutPinnedInNestedInput
  }

  export type PinnedTodoUncheckedUpdateWithoutPinnedListInput = {
    id?: IntFieldUpdateOperationsInput | number
    todoId?: StringFieldUpdateOperationsInput | string
    position?: IntFieldUpdateOperationsInput | number
  }

  export type PinnedTodoUncheckedUpdateManyWithoutPinnedListInput = {
    id?: IntFieldUpdateOperationsInput | number
    todoId?: StringFieldUpdateOperationsInput | string
    position?: IntFieldUpdateOperationsInput | number
  }

  export type TodoUpdateWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pinned?: BoolFieldUpdateOperationsInput | boolean
    position?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: TodoUpdateOneWithoutChildrenNestedInput
    children?: TodoUpdateManyWithoutParentNestedInput
    pinnedIn?: PinnedTodoUpdateManyWithoutTodoNestedInput
  }

  export type TodoUncheckedUpdateWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pinned?: BoolFieldUpdateOperationsInput | boolean
    position?: IntFieldUpdateOperationsInput | number
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: TodoUncheckedUpdateManyWithoutParentNestedInput
    pinnedIn?: PinnedTodoUncheckedUpdateManyWithoutTodoNestedInput
  }

  export type TodoUncheckedUpdateManyWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pinned?: BoolFieldUpdateOperationsInput | boolean
    position?: IntFieldUpdateOperationsInput | number
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}