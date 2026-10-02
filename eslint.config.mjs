import nx from "@nx/eslint-plugin";

export default [
    ...nx.configs["flat/base"],
    ...nx.configs["flat/typescript"],
    ...nx.configs["flat/javascript"],
    {
        ignores: [
            "**/dist",
            "**/out-tsc"
        ]
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.js",
            "**/*.jsx"
        ],
        rules: {
            "@nx/enforce-module-boundaries": [
                "error",
                {
                    enforceBuildableLibDependency: true,
                    allow: [
                        "^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$"
                    ],
                    depConstraints: [
                        {
                            sourceTag: "type:domain",
                            onlyDependOnLibsWithTags: ["type:domain"]
                        },
                        {
                            sourceTag: "type:application",
                            onlyDependOnLibsWithTags: ["type:domain", "type:application"]
                        },
                        {
                            sourceTag: "type:infrastructure",
                            onlyDependOnLibsWithTags: [
                                "type:domain",
                                "type:application",
                                "type:infrastructure",
                                "type:lib"
                            ]
                        },
                        {
                            sourceTag: "type:interface",
                            onlyDependOnLibsWithTags: [
                                "type:domain",
                                "type:application",
                                "type:interface",
                                "type:lib"
                            ]
                        },
                        {
                            sourceTag: "type:lib",
                            onlyDependOnLibsWithTags: ["type:lib"]
                        },
                        {
                            sourceTag: "type:app",
                            onlyDependOnLibsWithTags: ["*"]
                        }
                    ]
                }
            ]
        }
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.cts",
            "**/*.mts",
            "**/*.js",
            "**/*.jsx",
            "**/*.cjs",
            "**/*.mjs"
        ],
        // Override or add rules here
        rules: {}
    }
];
