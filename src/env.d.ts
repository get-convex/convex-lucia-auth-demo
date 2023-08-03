declare namespace Lucia {
  type Auth = import("../convex/lucia").Auth;
  type DatabaseUserAttributes = {
    _id: import("../convex/_generated/dataModel").Id<"users">;
    _creationTime: number;
    email: string;
  };
  type DatabaseSessionAttributes = {
    _id: import("../convex/_generated/dataModel").Id<"sessions">;
    _creationTime: number;
  };
}
