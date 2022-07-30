import { gql } from "@apollo/client";
import { GraphQLUpload, FileUpload } from "graphql-upload";


export const ADD_CARD = gql`
  mutation (
    $brand: Brand!
    $revealNumber: String!
    $serialNumber: String!
    $amount: Int!
    $imageName: String
    $image: String
  ) {
    createCard(
      brand: $brand
      revealNumber: $revealNumber
      serialNumber: $serialNumber
      amount: $amount
      imageName: $imageName
      image: $image
    )
  }
`;
