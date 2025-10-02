FROM odoo:17.0

USER root

# Install additional dependencies
RUN apt-get update && apt-get install -y \
    python3-pip \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
COPY requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt

USER odoo

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV ODOO_RC=/etc/odoo/odoo.conf

# Expose Odoo ports
EXPOSE 8069 8071 8072

# Set the default command
CMD ["odoo"] 