export const LANGUAGE_VERSIONS = {
  javascript: "18.15.0",
  typescript: "5.0.3",
  python: "3.10.0",
  java: "15.0.2",
  csharp: "6.12.0",
  php: "8.2.3",
};

export const CODE_SNIPPETS = {
  javascript: `\nfunction greet(name) {\n  console.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`,
  typescript: `\ntype Params = { name: string; }\n\nfunction greet(data: Params) {\n  console.log("Hello, " + data.name + "!");\n}\n\ngreet({ name: "Alex" });\n`,
  python: `\ndef greet(name):\n  print("Hello, " + name + "!")\n\ngreet("Alex")\n`,
  java: `\npublic class HelloWorld {\n  public static void main(String[] args) {\n    System.out.println("Hello World");\n  }\n}\n`,
  csharp:
    'using System;\n\nnamespace HelloWorld\n{\n  class Hello {\n    static void Main(string[] args) {\n      Console.WriteLine("Hello World in C#");\n    }\n  }\n}\n',
  php: "<?php\n\n$name = 'Alex';\necho $name;\n",
};