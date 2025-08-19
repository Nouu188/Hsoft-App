import { GraphQLScalarType, Kind } from 'graphql';

// Scalar này cho phép GraphQL hiểu và xử lý các object JSON.
export const GraphQLJSONObject = new GraphQLScalarType({
  name: 'JSONObject',
  description: 'JSON custom scalar type',
  parseValue(value: any) {
    return value; // value from the client
  },
  serialize(value: any) {
    return value; // value sent to the client
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.OBJECT) {
      const value = Object.create(null);
      ast.fields.forEach(field => {
        // @ts-ignore
        value[field.name.value] = this.parseLiteral(field.value);
      });
      return value;
    }
    return null;
  },
});