import React, { useState } from "react";
import { TouchableOpacity, Text, StyleSheet, Vibration } from "react-native";

interface CellProps {
    rowIndex: number;
    columnIndex: number;
}

function Cell({ rowIndex, columnIndex }: CellProps) {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isFlagged, setIsFlagged] = useState(false);

    function handlePress() {
        if (!isRevealed && !isFlagged) {
            setIsRevealed(true);
        }
        console.log('Cell pressed', rowIndex, columnIndex)
    }

    function handleLongPress() {
        if (!isRevealed) {
            setIsFlagged(!isFlagged);
            Vibration.vibrate(50);
        }
        console.log('Cell long pressed', rowIndex, columnIndex)
    }

    const styles = StyleSheet.create({
        cell: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: 'black',
        },
    });

    return (
        <TouchableOpacity
            style={styles.cell}
            onPress={handlePress}
            onLongPress={handleLongPress}
        >
            <Text>
                {isFlagged ? '!' : (isRevealed ? '0' : '')}
            </Text>
        </TouchableOpacity>
    )
}

export default Cell;