import React from "react";

import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";

import { Text } from "@chakra-ui/react";

dayjs.extend(LocalizedFormat);

const defaultLocale = dayjs.locale();

import { DateFieldProps } from "../types";

/**
 * This field is used to display dates. It uses {@link https://day.js.org/docs/en/display/format `Day.js`} to display date format and
 * Mantine {@link https://chakra-ui.com/docs/components/text `<Text>`} component
 *
 * @see {@link https://refine.dev/docs/api-reference/chakra-ui/components/fields/date} for more details.
 */
export const DateField: React.FC<DateFieldProps> = ({
    value,
    locales,
    format: dateFormat = "L",
    ...rest
}) => {
    return (
        <Text {...rest}>
            {dayjs(value)
                .locale(locales || defaultLocale)
                .format(dateFormat)}
        </Text>
    );
};
