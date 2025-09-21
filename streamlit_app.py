import streamlit as st\
\
st.title("My First Streamlit App")\
\
st.header("Slider Example")\
x = st.slider("Select a value")\
st.write(x, "squared is", x * x)\
}
