/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ExpressionFunction } from 'src/legacy/core_plugins/interpreter/public';
import { getFunctionHelp } from '../../strings';

interface Arguments {
  condition: boolean[] | null;
}

export function all(): ExpressionFunction<'all', any, Arguments, boolean> {
  const { help, args: argHelp } = getFunctionHelp().all;

  return {
    name: 'all',
    type: 'boolean',
    help,
    args: {
      condition: {
        aliases: ['_'],
        types: ['boolean', 'null'],
        required: true,
        multi: true,
        help: argHelp.condition,
      },
    },
    fn: (_context, args) => {
      const conditions = args.condition || [];
      return conditions.every(Boolean);
    },
  };
}
