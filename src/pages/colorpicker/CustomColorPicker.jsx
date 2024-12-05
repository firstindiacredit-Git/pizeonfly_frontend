import React, { useEffect, useState, useRef } from "react";

// Export the utility function
export function isLightColor(color) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 128;
}

const colorOptions = {
    standard: [
        '#000000', '#424242', '#666666', '#808080', '#999999', '#B3B3B3', '#CCCCCC', '#E6E6E6', '#F2F2F2', '#FFFFFF',
        '#FF0000', '#FF4500', '#FF8C00', '#FFD700', '#32CD32', '#00FF00', '#00CED1', '#0000FF', '#8A2BE2', '#FF00FF',
        '#FFB6C1', '#FFA07A', '#FFE4B5', '#FFFACD', '#98FB98', '#AFEEEE', '#87CEEB', '#E6E6FA', '#DDA0DD', '#FFC0CB',
        '#DC143C', '#FF4500', '#FFA500', '#FFD700', '#32CD32', '#20B2AA', '#4169E1', '#8A2BE2', '#9370DB', '#FF69B4',
        '#800000', '#D2691E', '#DAA520', '#808000', '#006400', '#008080', '#000080', '#4B0082', '#800080', '#C71585',
        '#fffacd', '#485563',
    ],
    custom: []
};

// Export the component as default
const CustomColorPicker = ({ color, onChange, onClose }) => {
    const [hexInput, setHexInput] = useState('');
    const pickerRef = useRef(null);

    const handleHexInput = (e) => {
        const value = e.target.value;
        setHexInput(value);

        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            onChange(value);
            setHexInput('');
            onClose();
        }
    };

    const handleHexKeyDown = (e) => {
        if (e.key === 'Enter') {
            let value = hexInput;
            if (value.charAt(0) !== '#') {
                value = '#' + value;
            }
            if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                onChange(value);
                setHexInput('');
                onClose();
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div ref={pickerRef} className="custom-color-picker mt-2" style={{
            position: 'absolute',
            zIndex: 1000,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            width: '250px'
        }}>
            <div style={{ marginBottom: '10px' }} className='border-bottom pb-2'>
                <strong>STANDARD</strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '2px' }}>
                    {colorOptions.standard.map((c, i) => (
                        <div
                            key={i}
                            onClick={() => {
                                onChange(c);
                                onClose();
                            }}
                            style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: c,
                                border: '1px solid #ccc',
                                cursor: 'pointer',
                                borderRadius: '9px',
                                position: 'relative'
                            }}
                            title={c}
                        >
                            {color === c && (
                                <span style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    color: isLightColor(c) ? '#000' : '#fff'
                                }}>✓</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <strong>ADD CUSTOM</strong>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {colorOptions.custom.map((c, i) => (
                        <div
                            key={i}
                            onClick={() => onChange(c)}
                            style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: c,
                                border: '1px solid #ccc',
                                cursor: 'pointer',
                                borderRadius: '9px'
                            }}
                            title={c}
                        />
                    ))}
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => onChange(e.target.value)}
                        style={{ width: '8rem' }}
                        title='Custom Color'
                    />
                    <input
                        type="text"
                        placeholder="Add Hex Color"
                        value={hexInput}
                        onChange={handleHexInput}
                        onKeyDown={handleHexKeyDown}
                        style={{ width: '100px' }}
                        title='Enter hex color (e.g., #FF0000)'
                    />
                </div>
            </div>
        </div>
    );
};

// Export both the component and the utility function
export default CustomColorPicker;