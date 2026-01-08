import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Colors from '../../theme/Colors';

export default function AddressAutocomplete({ value, onSelect, placeholder = "Введите адрес", error = false }) {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const handleTextChange = (text) => {
        setQuery(text);
        onSelect(text); // Вызываем onSelect при каждом изменении текста
    };

    useEffect(() => {
        if (query.length > 2) {
            searchAddress(query);
        } else {
            setSuggestions([]);
        }
    }, [query]);

    const searchAddress = async (text) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(text)},Warsaw,Poland&` +
                `format=json&` +
                `addressdetails=1&` +
                `limit=5&` +
                `countrycodes=pl`,
                {
                    headers: {
                        'User-Agent': 'BrightHouse-App'
                    }
                }
            );
            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error('Address search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (item) => {
        const address = item.display_name.split(',').slice(0, 3).join(',');
        setQuery(address);
        setSuggestions([]);
        onSelect(address);
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={[styles.input, error && styles.inputError]}
                value={query}
                onChangeText={handleTextChange}
                placeholder={placeholder}
                placeholderTextColor={Colors.textLight}
            />
            {loading && <ActivityIndicator style={styles.loader} color={Colors.primary} />}
            {suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item) => item.place_id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.suggestionItem}
                                onPress={() => handleSelect(item)}
                            >
                                <Text style={styles.suggestionText}>
                                    {item.display_name.split(',').slice(0, 3).join(',')}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        zIndex: 1000,
    },
    input: {
        backgroundColor: Colors.inputBackground,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        height: 56,
        paddingHorizontal: 16,
        fontSize: 16,
        color: Colors.text,
    },
    loader: {
        position: 'absolute',
        right: 16,
        top: 18,
    },
    suggestionsContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginTop: 4,
        maxHeight: 200,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    suggestionText: {
        fontSize: 14,
        color: Colors.text,
    },
    inputError: {
        borderColor: '#ef4444',
        borderWidth: 2,
        backgroundColor: '#fef2f2'
    }
});
