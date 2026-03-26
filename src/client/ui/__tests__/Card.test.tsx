import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../Card.js";

describe("Card", () => {
  it("renders card container", () => {
    const html = renderToStaticMarkup(<Card>Content</Card>);
    expect(html).toContain("<div");
    expect(html).toContain("Content");
    expect(html).toContain("rounded");
  });

  it("renders CardHeader", () => {
    const html = renderToStaticMarkup(<CardHeader>Header</CardHeader>);
    expect(html).toContain("Header");
  });

  it("renders CardTitle", () => {
    const html = renderToStaticMarkup(<CardTitle>Title</CardTitle>);
    expect(html).toContain("Title");
    expect(html).toContain("font-semibold");
  });

  it("renders CardContent", () => {
    const html = renderToStaticMarkup(<CardContent>Body</CardContent>);
    expect(html).toContain("Body");
  });

  it("renders CardFooter", () => {
    const html = renderToStaticMarkup(<CardFooter>Footer</CardFooter>);
    expect(html).toContain("Footer");
  });

  it("composes full card structure", () => {
    const html = renderToStaticMarkup(
      <Card>
        <CardHeader>
          <CardTitle>Test</CardTitle>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Foot</CardFooter>
      </Card>,
    );
    expect(html).toContain("Test");
    expect(html).toContain("Body");
    expect(html).toContain("Foot");
  });

  it("merges custom className on Card", () => {
    const html = renderToStaticMarkup(<Card className="w-96">X</Card>);
    expect(html).toContain("w-96");
  });
});
